const { getCurrentTime } = require("../helpers/helpers");
const stripe = require("../service/stripe");
const quote_model = require("../models/quote");
class Invoice {
    constructor() {}

    async CreateInvoice(req) {
        try {
            const payload = req.body;
            const table_prefix = req.body.table_prefix;
            const user_id = req.body.user_id;
            const quote_id = req.params.id;
            let [rows, fields] = await connectPool.query(
                `INSERT INTO ${table_prefix}invoice set ? `,
                {
                    customer_id: payload.customer_id,
                    quote_id: quote_id,
                    invoice_number: payload.invoice_number,
                    invoince_status: payload.invoice_status,
                    stripe_invoice_id: payload.stripe_invoice_id,
                    created_at: getCurrentTime(),
                    updated_at: getCurrentTime(),
                }
            );

            if (rows) {
                const stripe_key = await quote_model.getStripeDetailsByUserId(
                    req.body.user_id
                );
                if (stripe_key) {
                    stripe.UpdateInvoiceByInvoiceID(
                        stripe_key.stripe_secret_key,
                        payload.stripe_invoice_id,
                        {
                            table_prefix: table_prefix,
                            id: user_id,
                            stripe_customer_id: stripe_key.stripe_customer_id,
                            payment_method_id: stripe_key.payment_method_id,
                        }
                    );
                } else {
                    throw new Error(e);
                }
            }

            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async GetInvoices(req) {
        try {
            let input = req.body;
            const table_prefix = req.user.table_prefix;
            const payload = req.body;
            const customer_id = req.params.id;
            let search = input.search ? input.search : "";
            let offset = (input.page - 1) * input.limit;
            var searchString = input.search
                ? `and (a.invoince_status LIKE '%${search}%' OR b.email LIKE '%${search}%' OR b.first_name LIKE '%${search}%' OR b.last_name LIKE '%${search}%')`
                : "";

            const [rows_invoices, fields] = await connectPool.query(
                `SELECT a.*,b.email,concat(b.first_name," ",b.last_name) as name FROM  ${table_prefix}invoice as a 
                    LEFT JOIN ${table_prefix}customer_entries as b 
                    ON a.customer_id = b.id 
                    WHERE a.customer_id = ? ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`,
                [customer_id]
            );

            let count = "";

            count = await connectPool.query(
                `SELECT count(a.id) as totalRecords FROM  ${table_prefix}invoice as a 
                LEFT JOIN ${table_prefix}customer_entries as b ON a.customer_id = b.id 
                WHERE a.customer_id = ? ${searchString}`,
                [customer_id]
            );

            let totalRecords = await count[0][0]?.totalRecords;

            let data = {
                invoices: rows_invoices,
                totalRecords: totalRecords,
            };

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async UpdateInvoicePaymentStatus(invoice_id, status, table_prefix) {
        let [rows, fields] = await connectPool.query(
            `SELECT * FROM  ${table_prefix}invoice WHERE stripe_invoice_id = ? ORDER BY id DESC LIMIT 1`,
            [invoice_id]
        );
        if (rows.length > 0) {
            await connectPool.query(
                `UPDATE ${table_prefix}invoice set invoince_status = ? WHERE stripe_invoice_id = ?`,
                [status, invoice_id]
            );
        }
        return rows;
    }
}
module.exports = new Invoice();
