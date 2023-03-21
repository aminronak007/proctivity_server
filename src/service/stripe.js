const dotenv = require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
    getCurrentTime,
    TotalDaysInAMonth,
    getLogo,
    getSettings,
} = require("../helpers/helpers");
const moment = require("moment-timezone");
const users_model = require("../models/user");
const auth_model = require("../models/auth");
const CURRENCY = process.env.CURRENCY;
const subscribe_modal = require("../models/subscribe");
const SubscriptionPurchased = require("../emailTemplates/SubscriptionPurchased");
const emailHandler = require("../handlers/emailhandler");
const { createWriteStream } = require("fs");
var fs = require("fs");

class StripeService {
    constructor() {}

    // Create Checkout using stripe payment method.
    async CreateCheckout(user, payload) {
        try {
            if (user?.package?.package_type === "Monthly") {
                let data = {
                    subscription_id: user.package.subscription_id,
                    user_id: user.id,
                    user_package_id: user.package.user_package_id,
                };
                await this.cancel_subscription(data);
            }

            let payment_method_id = user.payment_method_id;
            let stripe_customer_id = user.stripe_customer_id;
            let price = payload.package_price;
            price = price * 100;
            const expirydate = payload.expirydate;
            const package_type = payload.package_type;
            let interval = "";
            if (package_type == "Monthly") {
                interval = "month";
            } else {
                interval = "year";
            }
            let exp_month = null;
            let exp_year = null;
            if (expirydate != null) {
                const month_year = expirydate.split("/");
                exp_month = month_year[0];
                exp_year = month_year[1];
            }

            const cardnumber = payload.cardnumber;
            const csv = payload.csv;

            const paymentMethod = await stripe.paymentMethods.create({
                type: "card",
                card: {
                    number: cardnumber,
                    exp_month: exp_month,
                    exp_year: exp_year,
                    cvc: csv,
                },
                billing_details: {
                    address: {
                        city: user.city,
                        country: "AU",
                        line1: user.address_line1,
                        postal_code: user.postal_code,
                        state: user.state,
                    },
                    email: user.email,
                    name: user.companyname,
                    phone: user.phone,
                },
            });
            if (paymentMethod.id) {
                payment_method_id = paymentMethod.id;
            }

            if (stripe_customer_id != null && payment_method_id != null) {
                const customer_info = await stripe.customers.retrieve(
                    stripe_customer_id
                );

                if (customer_info.id && customer_info.deleted != true) {
                    const paymentMethod_attach =
                        await stripe.paymentMethods.attach(payment_method_id, {
                            customer: stripe_customer_id,
                        });
                    const customer_update = await stripe.customers.update(
                        customer_info.id,
                        {
                            invoice_settings: {
                                default_payment_method: payment_method_id,
                            },
                        }
                    );
                }
            }

            if (stripe_customer_id == null && payment_method_id != null) {
                const customer = await stripe.customers.create({
                    name: user.companyname,
                    email: user.email,
                    phone: user.phone,
                    payment_method: payment_method_id,
                    metadata: {
                        id: user.id,
                        username: user.username,
                        current_package_id: user.current_package_id,
                    },
                    invoice_settings: {
                        default_payment_method: payment_method_id,
                    },
                });
                if (customer.id) {
                    stripe_customer_id = customer.id;
                }
            }

            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                customer: stripe_customer_id,
                line_items: [
                    {
                        price_data: {
                            currency: CURRENCY,
                            product_data: {
                                name:
                                    "Product for " +
                                    user.companyname +
                                    ": User id: " +
                                    user.id,
                            },
                            unit_amount: price,
                            recurring: {
                                interval: interval,
                            },
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    id: user.id,
                    username: user.username,
                    current_package_id: user.current_package_id,
                    stripe_customer_id: stripe_customer_id,
                    payment_method_id: payment_method_id,
                    cardname: payload.cardname,
                    cardnumber: payload.cardnumber,
                    cvv: payload.cvv,
                    expirydate: payload.expirydate,
                    package_id: payload.package_id,
                    package_price: payload.package_price,
                    package_type: payload.package_type,
                    price_id: payload.price_id,
                    autoRenew: payload.autoRenew,
                },
                success_url: `${process.env.domainURL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.domainURL}/subscription/canceled`,
            });
            return {
                url: session.url,
                stripe_customer_id: stripe_customer_id,
                payment_method_id: payment_method_id,
            };
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Retrieve subscription details after success.
    async success_subscription(id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(id);
            if (session) {
                const subscription_id = session.subscription;
                const payment_status = session.payment_status;
                const metadata = session.metadata;

                if (metadata) {
                    await users_model.updateCardDetails(metadata.id, metadata);
                    await auth_model.assignUserPackage(metadata.id, {
                        user_id: metadata.id,
                        package_id: metadata.package_id,
                        package_price: metadata.package_price,
                        package_type: metadata.package_type,
                        payment_type: payment_status,
                        subscription_id: subscription_id,
                        autoRenew: metadata.autoRenew !== "false" ? 1 : 0,
                        created_at: getCurrentTime(),
                        updated_at: getCurrentTime(),
                    });
                    await users_model.updateStripeSettings(
                        metadata.id,
                        metadata
                    );

                    const [get_email, fields] = await connectPool.query(
                        `SELECT email from users WHERE id = ?`,
                        [metadata.id]
                    );

                    let subject = "Subscription Purchased";
                    const msg = await SubscriptionPurchased.MailSent({
                        username: metadata.username,
                    });

                    const emailSend = await emailHandler.sendEmail(
                        get_email[0].email,
                        msg,
                        subject,
                        "",
                        getLogo()
                    );
                }

                const autoRenew = metadata.autoRenew;
                let cancel_at_period_end = true;
                if (autoRenew !== "false") {
                    cancel_at_period_end = false;
                }
                delete metadata.cardname;
                delete metadata.cardnumber;
                delete metadata.cvv;
                delete metadata.expirydate;
                const subscription = await stripe.subscriptions.update(
                    subscription_id,
                    {
                        cancel_at_period_end: cancel_at_period_end,
                        metadata: metadata,
                    }
                );
            }
            return [session];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Cancel Subscription using stripe subscription delete method.
    async cancel_subscription(payload) {
        try {
            const deleted = await stripe.subscriptions.del(
                payload.subscription_id
            );
            await auth_model.CancelUserPackage(payload);
            return [deleted];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update Card Details using stripe payment methods.
    async updateStripeCardDetail(user, payload) {
        try {
            let stripe_customer_id = user.stripe_customer_id;
            let payment_method_id = user.payment_method_id;
            const expirydate = payload.expirydate;
            let exp_month = null;
            let exp_year = null;
            if (expirydate != null) {
                const month_year = expirydate.split("/");
                exp_month = month_year[0];
                exp_year = month_year[1];
            }
            const cardnumber = payload.cardnumber;
            const csv = payload.csv;
            const subscription_id = user.package.subscription_id;

            const paymentMethod = await stripe.paymentMethods.create({
                type: "card",
                card: {
                    number: cardnumber,
                    exp_month: exp_month,
                    exp_year: exp_year,
                    cvc: csv,
                },
                billing_details: {
                    address: {
                        city: user.city,
                        country: "AU",
                        line1: user.address_line1,
                        postal_code: user.postal_code,
                        state: user.state,
                    },
                    email: user.email,
                    name: user.companyname,
                    phone: user.phone,
                },
            });
            if (paymentMethod.id) {
                payment_method_id = paymentMethod.id;
            }
            if (stripe_customer_id != null && payment_method_id != null) {
                const customer_info = await stripe.customers.retrieve(
                    stripe_customer_id
                );

                if (customer_info.id && customer_info.deleted != true) {
                    const paymentMethod_attach =
                        await stripe.paymentMethods.attach(payment_method_id, {
                            customer: stripe_customer_id,
                        });
                    const customer_update = await stripe.customers.update(
                        customer_info.id,
                        {
                            invoice_settings: {
                                default_payment_method: payment_method_id,
                            },
                        }
                    );
                }

                const subscription = await stripe.subscriptions.update(
                    subscription_id,
                    { default_payment_method: payment_method_id }
                );

                await users_model.updateStripeSettings(user.id, {
                    payment_method_id: payment_method_id,
                    stripe_customer_id: stripe_customer_id,
                });
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching Subscription details using strip retrieve method and subscription id.
    async subscription_info(id) {
        try {
            const subscription = await stripe.subscriptions.retrieve(id);
            return subscription;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Updating Subscription Price using subscription id.
    async updateSubscriptionPrice(subscription_id, price_id) {
        try {
            const subscription = await stripe.subscriptions.retrieve(
                subscription_id
            );
            const update_Sub = stripe.subscriptions.update(subscription_id, {
                cancel_at_period_end: false,
                proration_behavior: "none",
                items: [
                    {
                        id: subscription.items.data[0].id,
                        price: price_id,
                    },
                ],
            });
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Creating prices using stripe price create method.
    async createPrice(payload) {
        try {
            const price = await stripe.prices.create({
                unit_amount: payload.price,
                currency: "inr",
                recurring: { interval: payload.type },
                product: `${process.env.STRIPE_PRODUCT_ID}`,
            });
            return price?.id;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update auto renewal of subscription
    async update_auto_renew(subscription_id, autoRenew) {
        try {
            const session = await stripe.subscriptions.retrieve(
                subscription_id
            );
            if (session) {
                const metadata = session.metadata;
                if (metadata) {
                    let cancel_at_period_end = true;
                    if (autoRenew) {
                        cancel_at_period_end = false;
                    }
                    metadata.autoRenew = autoRenew ? "true" : "false";
                    const subscription = await stripe.subscriptions.update(
                        subscription_id,
                        {
                            cancel_at_period_end: cancel_at_period_end,
                            metadata: metadata,
                        }
                    );
                    subscribe_modal.updateAutoRenew({
                        subscription_id: subscription_id,
                        autoRenew: autoRenew,
                    });
                }
                return [session];
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching added subuser payment details.
    async GetSubUserPayment(user, payload, id) {
        try {
            const previous_subscription_item_id =
                await users_model.get_subscription_item_id(user.id);

            let subscription_item_id =
                previous_subscription_item_id.subscription_item_id;
            const user_package = user.package;
            const package_id = user_package.id;
            let difference_in_days = 0;
            const package_type = user_package.package_type;
            const current_time = getCurrentTime();
            const package_expiry_date = user_package.package_expiry_date;
            const now = moment(current_time, "YYYY-MM-DD HH:mm:ss");
            const exp_date = moment(package_expiry_date, "YYYY-MM-DD HH:mm:ss");
            const daysInMonth = TotalDaysInAMonth(now);
            let new_price = 0;
            let monthly_price_per_user = 0;
            const subscription_id = user_package.subscription_id;
            monthly_price_per_user = user_package.monthly_price_per_user;

            let interval = "";
            if (package_type == "Monthly") {
                interval = "month";
            } else {
                interval = "year";
            }
            if (package_type === "Monthly") {
                difference_in_days = exp_date.diff(now, "days");
                new_price = (
                    (difference_in_days * monthly_price_per_user) /
                    daysInMonth
                ).toFixed(2);
            } else if (package_type === "Yearly") {
                difference_in_days = exp_date.diff(now, "months");
                new_price = monthly_price_per_user * difference_in_days;
            }
            if (
                subscription_id != null &&
                subscription_id != "" &&
                subscription_id != undefined
            ) {
                let subscription_update;
                if (
                    subscription_item_id !== undefined &&
                    subscription_item_id !== null
                ) {
                    const subscriptionItem =
                        await stripe.subscriptionItems.retrieve(
                            subscription_item_id
                        );
                    subscription_update = await stripe.subscriptionItems.update(
                        subscription_item_id,
                        { quantity: parseInt(subscriptionItem.quantity + 1) }
                    );
                } else {
                    const product = await stripe.products.create({
                        name:
                            "Product for New Sub User" +
                            payload.username +
                            ": User id: " +
                            id,
                    });
                    subscription_update = await stripe.subscriptions.update(
                        subscription_id,
                        {
                            proration_behavior: "none",
                            items: [
                                {
                                    price_data: {
                                        currency: CURRENCY,
                                        product: product.id,
                                        unit_amount_decimal:
                                            monthly_price_per_user * 100,
                                        recurring: {
                                            interval: interval,
                                        },
                                    },
                                    quantity: 1,
                                },
                            ],
                        }
                    );

                    if (subscription_update.items.data.length > 0) {
                        subscription_update.items.data.forEach((row, index) => {
                            const product_id = row.price.product;

                            if (product_id === product.id) {
                                subscription_item_id = row.id;
                            }
                        });
                    }
                }

                if (subscription_update) {
                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: new_price * 100,
                        currency: CURRENCY,
                        payment_method_types: ["card"],
                        customer: user.stripe_customer_id,
                        description:
                            "Payment For Sub User" +
                            payload.username +
                            ": User id: " +
                            id,
                        confirm: true,
                        off_session: true,
                        payment_method: user.payment_method_id,
                    });
                    const [row_paymentIntent, fields_paymentIntent] =
                        await connectPool.query(
                            "INSERT INTO sub_user_payment_history SET ?",
                            {
                                user_id: id,
                                resp: JSON.stringify(paymentIntent),
                            }
                        );
                    let payment_type = paymentIntent.status;
                    if (payment_type === "succeeded") payment_type = "paid";
                    await auth_model.assignUserPackage(user.id, {
                        user_id: user.id,
                        package_id: package_id,
                        package_price: new_price,
                        package_type: package_type,
                        payment_type: payment_type,
                        subscription_id: subscription_id,
                        created_at: getCurrentTime(),
                        updated_at: getCurrentTime(),
                        reference: "User",
                        sub_user_id: id,
                    });
                    if (subscription_item_id != null) {
                        const [rows_sub, fields_insert] =
                            await connectPool.query(
                                `UPDATE 
                        users 
                    SET 
                        subscription_item_id = '${subscription_item_id}' 
                    WHERE 
                        users.id = ?`,
                                [id]
                            );
                    }
                }
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Removing Subscription Item by its id.
    async RemoveSubscriptionItem(id) {
        try {
            const user_detail = await users_model.getUserDetails(id);
            if (
                user_detail.subscription_item_id != null &&
                user_detail.subscription_item_id != undefined
            ) {
                const deleted = await stripe.subscriptionItems.del(
                    user_detail.subscription_item_id
                );

                if (deleted.deleted) {
                    return true;
                }
            }

            return false;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async CreateQuote(req) {
        const table_prefix = req.user.table_prefix;
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);
        const payload = req.body;
        let line_items = [];
        if (payload.line_items.length > 0) {
            for (let i = 0; i < payload.line_items.length; i++) {
                const row = payload.line_items[i];
                let product = await stripe.products.create({
                    name: row.item_name,
                });
                line_items.push({
                    price_data: {
                        currency: process.env.CURRENCY,
                        product: product.id,
                        unit_amount_decimal: parseFloat(row.item_price * 100),
                    },
                    quantity: row.item_quantity,
                });
            }
        }
        const quote = await stripe_customer.quotes.create({
            customer: payload.customer_stripe_id,
            line_items: line_items,
            collection_method: "send_invoice",
            invoice_settings: {
                days_until_due: 3,
            },
            metadata: {
                table_prefix: table_prefix,
            },
        });

        return quote;

        // const quote_id = quote.id;
        // const quote_finalize = await stripe.quotes.finalizeQuote(quote_id);
        // const quote_accept = await stripe.quotes.accept(quote_id);
        // const invoice = await stripe.invoices.sendInvoice(quote_accept.invoice);

        // const pdf = await stripe.quotes.pdf(quote_id);

        // await new Promise((resolve) => {
        //     pdf.pipe(
        //         createWriteStream(
        //             process.env.UPLOAD_DIR + `/quotes/${quote_id}.pdf`
        //         )
        //     );
        //     pdf.on("end", () => resolve());
        // });
    }

    async RetriveQuoteLineItems(req, id) {
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);
        const items = await stripe_customer.quotes.listLineItems(id, {
            limit: 100,
        });
        return items.data;
    }

    async CancelQuote(req, id) {
        const stripe_customer = require("stripe")(req.body.stripe_secret_key);
        const quote = await stripe_customer.quotes.cancel(id);
        return quote;
    }

    async FinalizeQuote(req, id) {
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);
        const quote = await stripe_customer.quotes.finalizeQuote(id);
        return quote;
    }

    async AcceptQuote(req, id) {
        const stripe_customer = require("stripe")(req.body.stripe_secret_key);
        const quote = await stripe_customer.quotes.accept(id);
        return quote;
    }

    async UpdateInvoiceByInvoiceID(stripe_key, id, metaData) {
        const stripe_customer = require("stripe")(stripe_key);
        const invoice = await stripe_customer.invoices.update(id, {
            metadata: metaData,
        });
    }

    async StoreQuote(stripe_key, quote_id) {
        const stripe_customer = require("stripe")(stripe_key);
        const pdf = await stripe_customer.quotes.pdf(quote_id);
        await new Promise((resolve) => {
            if (!fs.existsSync(`${process.env.UPLOAD_DIR}/quotes`)) {
                fs.mkdirSync(`${process.env.UPLOAD_DIR}/quotes`);
            }
            pdf.pipe(
                createWriteStream(
                    process.env.UPLOAD_DIR + `/quotes/${quote_id}.pdf`
                )
            );
            pdf.on("end", () => resolve());
        });
    }

    async UpdateQuote(req) {
        const payload = req.body;
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);

        let line_items = [];
        if (payload.line_items.length > 0) {
            for (let i = 0; i < payload.line_items.length; i++) {
                const row = payload.line_items[i];
                if (
                    row.quote_line_item_id !== undefined &&
                    row.quote_line_item_id !== null
                ) {
                    let product = await stripe.products.create({
                        name: row.item_name,
                    });
                    line_items.push({
                        id: row.quote_line_item_id,
                        price_data: {
                            currency: process.env.CURRENCY,
                            product: product.id,
                            unit_amount_decimal: parseFloat(
                                row.item_price * 100
                            ),
                        },
                        quantity: row.item_quantity,
                    });
                } else {
                    let product = await stripe_customer.products.create({
                        name: row.item_name,
                    });
                    line_items.push({
                        price_data: {
                            currency: process.env.CURRENCY,
                            product: product.id,
                            unit_amount_decimal: parseFloat(
                                row.item_price * 100
                            ),
                        },
                        quantity: row.item_quantity,
                    });
                }
            }
        }
        const quote = await stripe_customer.quotes.update(payload.quote_id, {
            line_items: line_items,
        });

        return quote;
    }

    async CreateStripeCustomer(payload) {
        const stripe_customer = require("stripe")(payload.stripe_key);

        const customer = await stripe_customer.customers.create({
            address: {
                city: payload.city,
                country: payload.country,
                line1: payload.address,
                postal_code: payload.postal_code,
                state: payload.state,
            },
            email: payload.email,
            name: payload.first_name + " " + payload.last_name,
            shipping: {
                address: {
                    city: payload.city,
                    country: payload.country,
                    line1: payload.address,
                    postal_code: payload.postal_code,
                    state: payload.state,
                },
                name: payload.first_name + " " + payload.last_name,
            },
            metadata: {
                customer_id: payload.customer_id,
            },
        });

        const [update_customer_entry, update_fields] = await connectPool.query(
            `UPDATE ${payload.table_name}customer_entries SET
            stripe_customer_id = ?
            WHERE id = ?`,
            [customer.id, payload.customer_id]
        );
    }

    async GetInvoiceInfo(id) {
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);
        const invoice = await stripe_customer.invoices.retrieve(id);
        return invoice;
    }

    async FinalizeInvoice(stripe_key, id) {
        const stripe_customer = require("stripe")(stripe_key);
        const invoice = await stripe_customer.invoices.finalizeInvoice(id);
        return invoice;
    }

    async RetriveInvoiceinfo(req, id) {
        const stripe_customer = require("stripe")(req.user.stripe_secret_key);
        const invoice = await stripe_customer.invoices.retrieve(id);
        return invoice;
    }

    async RetriveQuotefo(stripe_key, id) {
        const stripe_customer = require("stripe")(stripe_key);
        const quote = await stripe_customer.quotes.retrieve(id);
        return quote;
    }

    async RegisterAndUpdateWebhooks(user, payload) {
        try {
            const stripe_custom = require("stripe")(payload.stripe_secret_key);
            const webhook_id = user.webhook_id;
            if (webhook_id !== null && webhook_id !== undefined) {
                const webhookEndpoint =
                    await stripe_custom.webhookEndpoints.retrieve(webhook_id);
                if (
                    webhookEndpoint.id !== undefined ||
                    webhookEndpoint !== null
                ) {
                    return true;
                }
            }
            let url = process.env.domainURL;
            if (url.includes("localhost")) {
                url = "https://webhook.site";
            }
            const webhookEndpoint = await stripe_custom.webhookEndpoints.create(
                {
                    url: url + "/webhook",
                    enabled_events: ["*"],
                }
            );

            if (
                webhookEndpoint.id !== undefined &&
                webhookEndpoint.id !== null
            ) {
                const [rows, updateFields] = await connectPool.query(
                    `UPDATE users SET 
                    webhook_id = ?
                    WHERE users.id = ?`,
                    [webhookEndpoint.id, user.id]
                );

                return true;
            }

            return false;
        } catch (e) {
            const [rows, updateFields] = await connectPool.query(
                `UPDATE users SET 
                    webhook_id = ?
                    WHERE users.id = ?`,
                [null, user.id]
            );
            console.log(e);
            return false;
        }
    }

    async RegisterProctivityAsConnectedAccount(user) {
        const stripe_custom = require("stripe")(user.stripe_secret_key);

        const account = await stripe.accounts.create({
            type: "custom",
            country: "AU",
            email: "jenny.rosen@example.com",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
    }

    async chargeCustomerForInvoice(
        metadata,
        invoice_id,
        table_prefix,
        invoice_amount
    ) {
        let invoice_commision = await getSettings("commision_per_invoice");
        let commission =
            (parseFloat(invoice_amount) / 100) *
            (parseFloat(invoice_commision) / 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(commission * 100),
            currency: CURRENCY,
            payment_method_types: ["card"],
            customer: metadata.stripe_customer_id,
            description: "charge agains invoice",
            confirm: true,
            off_session: true,
            payment_method: metadata.payment_method_id,
            metadata: {
                user_id: metadata.id,
                amount: commission,
                invoice_id: invoice_id,
                table_prefix: table_prefix,
            },
        });

        await connectPool.query("INSERT INTO invoice_charges SET ?", {
            user_id: metadata.id,
            amount: commission,
            invoice_id: invoice_id,
            table_prefix: table_prefix,
            resp: JSON.stringify(paymentIntent),
            created_at: getCurrentTime(),
            updated_at: getCurrentTime(),
        });
    }
}

module.exports = new StripeService();
