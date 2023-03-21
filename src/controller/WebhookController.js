const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Package = require("../models/SuperAdmin/package");
const env = require("dotenv").config();
const stripe_service = require("../service/stripe");
const subscription_model = require("../models/subscribe");
const invoice_model = require("../models/invoice");
const quote = require("../models/quote");
const stripe = require("stripe")(
    "sk_test_51039TY2m5fPKBOnnSsJ9BC9cuxayXSqzDl6yc1wSZxygTDcFKkXyiKUg07hfyWlppzTNi7Zo5uhuQFNs5bjdWp9e00PuryNsxM"
);

class WebhookController {
    constructor() {}
    async index(req, res) {
        let data;
        let eventType;
        data = req.body.data;
        eventType = req.body.type;
        switch (eventType) {
            case "customer.subscription.updated":
                const subscription = data.object;
                const subscription_id = subscription.id;
                const status = subscription.status;
                if (subscription_id !== null) {
                    const user_package_subscrption_info =
                        await subscription_model.user_packge_subscription_info(
                            subscription_id
                        );
                }

                break;
            case "invoice.payment_succeeded":
                const invoice = data.object;
                const invoice_amount = invoice.amount_due;
                const invoice_subscription_id = invoice.subscription;
                const invoice_status = invoice.status;
                if (invoice_subscription_id !== null) {
                    await subscription_model.renew_packge(
                        invoice_subscription_id,
                        invoice_amount,
                        "paid"
                    );
                }

                const invoice_id = invoice.id;
                const quote = invoice.quote;
                const Invoicestatus = invoice.status;

                if (invoice_id !== null && quote !== null) {
                    const table_prefix = invoice.metadata.table_prefix;
                    if (table_prefix !== undefined && table_prefix !== null) {
                        await invoice_model.UpdateInvoicePaymentStatus(
                            invoice_id,
                            Invoicestatus,
                            table_prefix
                        );

                        await stripe_service.chargeCustomerForInvoice(
                            invoice.metadata,
                            invoice_id,
                            table_prefix,
                            invoice_amount
                        );
                    }
                }

                break;
            case "invoice.payment_failed":
                const invoice_failed = data.object;
                const invoice_failed_amount = invoice_failed.amount_due;
                const invoice_failed_subscription_id =
                    invoice_failed.subscription;
                const invoice_failed_status = invoice_failed.status;
                if (invoice_failed_subscription_id !== null) {
                    await subscription_model.renew_packge(
                        invoice_failed_subscription_id,
                        invoice_failed_amount,
                        "payment_failed"
                    );
                }

                const invoice_id_failed = invoice_failed.id;
                const quote_failed = invoice_failed.quote;
                const Invoicestatus_failed = invoice_failed.status;

                if (invoice_id_failed !== null && quote_failed !== null) {
                    const table_prefixQ = invoice_failed.metadata.table_prefix;
                    if (table_prefixQ !== undefined && table_prefixQ !== null) {
                        await invoice_model.UpdateInvoicePaymentStatus(
                            invoice_id_failed,
                            Invoicestatus_failed,
                            table_prefixQ
                        );
                    }
                }

                break;
            default:
                console.log(eventType);
        }

        await subscription_model.webhooklog(data, eventType);

        res.sendStatus(200);
    }

    async update(req, res) {
        const webhookEndpoint = await stripe.webhookEndpoints.update(
            "we_1KjIhY2m5fPKBOnnCkZaMFW8",
            {
                metadata: {
                    table_prefix: "user_1_",
                    user_id: "1",
                },
            }
        );

        res.send(webhookEndpoint);
    }
}

module.exports = new WebhookController();
