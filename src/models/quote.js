const stripe_service = require("../service/stripe");
const { getCurrentTime } = require("../helpers/helpers");
class Quote {
    constructor() {}
    async CreateQuote(req) {
        try {
            const payload = req.body;
            const table_prefix = req.user.table_prefix;
            let [rows, fields] = await connectPool.query(
                `INSERT INTO ${table_prefix}quote_header set ? `,
                {
                    customer_id: payload.customer_id,
                    total_items: payload.total_items,
                    total_quantity: payload.total_quantity,
                    sub_total: payload.sub_total,
                    total_price: payload.total_price,
                    quote_status: payload.quote_status,
                    quote_id: payload.quote_id,
                    created_at: getCurrentTime(),
                    updated_at: getCurrentTime(),
                }
            );
            const quote_items = await stripe_service.RetriveQuoteLineItems(
                req,
                payload.quote_id
            );

            if (payload.line_items.length > 0) {
                for (let i = 0; i < payload.line_items.length; i++) {
                    const row = payload.line_items[i];
                    const line_item_obj = quote_items.filter((data) => {
                        return data.description == row.item_name;
                    });
                    let quote_line_item_id = null;
                    if (
                        line_item_obj.length > 0 &&
                        line_item_obj[0].id !== undefined
                    ) {
                        quote_line_item_id = line_item_obj[0].id;
                    }
                    let [rows_items, fields_items] = await connectPool.query(
                        `INSERT INTO ${table_prefix}quote_items set ? `,
                        {
                            customer_id: payload.customer_id,
                            quote_id: rows.insertId,
                            item_name: row.item_name,
                            item_price: row.item_price,
                            item_quantity: row.item_quantity,
                            created_at: getCurrentTime(),
                            updated_at: getCurrentTime(),
                            quote_line_item_id: quote_line_item_id,
                        }
                    );
                }
            }
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async GetQuotes(req) {
        let input = req.body;
        const table_prefix = req.user.table_prefix;
        const customer_id = req.params.id;
        try {
            let search = input.search ? input.search : "";
            let offset = (input.page - 1) * input.limit;
            var searchString = input.search
                ? `and (a.total_price LIKE '%${search}%' OR a.quote_status LIKE '%${search}%' OR b.email LIKE '%${search}%' OR b.first_name LIKE '%${search}%' OR b.last_name LIKE '%${search}%')`
                : "";

            const [rows_quotes, fields] = await connectPool.query(
                `SELECT a.*,b.email,concat(b.first_name," ",b.last_name) as name FROM  ${table_prefix}quote_header as a 
                LEFT JOIN ${table_prefix}customer_entries as b 
                ON a.customer_id = b.id 
                WHERE a.customer_id = ? ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`,
                [customer_id]
            );

            let count = "";

            count = await connectPool.query(
                `SELECT count(a.id) as totalRecords FROM  ${table_prefix}quote_header as a 
                LEFT JOIN ${table_prefix}customer_entries as b ON a.customer_id = b.id 
                WHERE a.customer_id = ? ${searchString}`,
                [customer_id]
            );

            let totalRecords = await count[0][0]?.totalRecords;

            let data = {
                quotes: rows_quotes,
                totalRecords: totalRecords,
            };

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async GetQuoteDetail(req) {
        try {
            const table_prefix = req.body.table_prefix;
            const payload = req.body;
            const id = req.params.id;
            const quote_header = table_prefix + "quote_header";
            const quote_items = table_prefix + "quote_items";
            const customer_entries = table_prefix + "customer_entries";
            const [rows, fields] = await connectPool.query(
                `SELECT a.*,concat(b.first_name," ",b.last_name) as fullName,b.email,b.group_id,b.status_id
                 FROM  ${quote_header} as a 
                 LEFT JOIN 
                 ${customer_entries} as b 
                 ON a.customer_id = b.id
                 WHERE a.id = ?`,
                [id]
            );

            const [line_items, field] = await connectPool.query(
                `SELECT * FROM ${quote_items} WHERE quote_id = ?`,
                [id]
            );
            rows[0].line_items = line_items;
            if (rows.length == 1) {
                return rows[0];
            }
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async UpdateQuote(req) {
        try {
            const payload = req.body;
            const table_prefix = req.user.table_prefix;
            let [rows, fields] = await connectPool.query(
                `UPDATE ${table_prefix}quote_header set  
                    total_items = ?,
                    total_quantity = ?,
                    sub_total = ?,
                    total_price = ?,
                    quote_status = ?,
                    quote_id = ?,
                    updated_at = ?
                    WHERE id = ?
                `,
                [
                    payload.total_items,
                    payload.total_quantity,
                    payload.sub_total,
                    payload.total_price,
                    payload.quote_status,
                    payload.quote_id,
                    getCurrentTime(),
                    req.params.id,
                ]
            );

            if (payload.line_items.length > 0) {
                let [rows_delete, fields_delete] = await connectPool.query(
                    `DELETE FROM  ${table_prefix}quote_items WHERE quote_id = ?`,
                    [req.params.id]
                );
                for (let i = 0; i < payload.line_items.length; i++) {
                    const row = payload.line_items[i];
                    let [rows_items, fields_items] = await connectPool.query(
                        `INSERT INTO ${table_prefix}quote_items set ? `,
                        {
                            customer_id: payload.customer_id,
                            quote_id: req.params.id,
                            item_name: row.item_name,
                            item_price: row.item_price,
                            item_quantity: row.item_quantity,
                            created_at: getCurrentTime(),
                            updated_at: getCurrentTime(),
                        }
                    );
                }
            }
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async UpdateQuteStatus(req) {
        try {
            const payload = req.body;
            const table_prefix = req.body.table_prefix;
            let str = "";
            if (payload.quote_number !== undefined) {
                let [rows, fields] = await connectPool.query(
                    `UPDATE ${table_prefix}quote_header set  
                    quote_status = ?,
                    quote_number = ?,
                    updated_at = ?
                    WHERE id = ?
                `,
                    [
                        payload.quote_status,
                        payload.quote_number,
                        getCurrentTime(),
                        req.params.id,
                    ]
                );
            } else {
                let [rows, fields] = await connectPool.query(
                    `UPDATE ${table_prefix}quote_header set  
                    quote_status = ?,
                    updated_at = ?
                    WHERE id = ?
                `,
                    [payload.quote_status, getCurrentTime(), req.params.id]
                );
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async DeleteQuote(req) {
        const table_prefix = req.user.table_prefix;
        const id = req.params.id;
        try {
            const [rows_quotes, fields] = await connectPool.query(
                `SELECT id,quote_id from ${table_prefix}quote_header WHERE id = ? LIMIT 1`,
                [id]
            );

            if (rows_quotes.length === 1) {
                const [rows, updateFields] = await connectPool.query(
                    `DELETE FROM ${table_prefix}quote_header
                          WHERE id = ?`,
                    [id]
                );
                if (rows) {
                    const [rows, updateFields] = await connectPool.query(
                        `DELETE FROM ${table_prefix}quote_items
                              WHERE quote_id = ?`,
                        [id]
                    );
                }
                return rows_quotes;
            }
            return rows_quotes;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getQuoteDetailsFromQuoteId(req) {
        const table_prefix = req.body.table_prefix;
        const id = req.params.id;
        try {
            const [rows_quotes, fields] = await connectPool.query(
                `SELECT id from ${table_prefix}quote_header WHERE quote_id = ? LIMIT 1`,
                [id]
            );

            if (rows_quotes.length === 1) {
                req.params.id = rows_quotes[0].id;
                const quote_detail = await this.GetQuoteDetail(req);
                return quote_detail;
            }
            return rows_quotes;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getStripeDetailsByUserId(user_id) {
        try {
            const [rows_stripes, fields] = await connectPool.query(
                `SELECT stripe_secret_key,stripe_customer_id,payment_method_id from users WHERE id = ?`,
                [user_id]
            );

            console.log(rows_stripes[0], "rows_stripes[0]");
            if (rows_stripes.length === 1) {
                return rows_stripes[0];
            }
            return false;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
}

module.exports = new Quote();
