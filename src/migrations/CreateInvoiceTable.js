class CreateInvoiceTable {
    constructor() {}

    async create(prefix) {
        try {
            const migration_name = prefix + "CreateInvoiceTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = prefix + "invoice";

            if (rows.length == 0) {
                let [create, fields_create] = await connectPool.query(
                    `CREATE TABLE IF NOT EXISTS ` +
                        table_name +
                        ` (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    customer_id INT DEFAULT NULL,
                    quote_id INT DEFAULT NULL,
                    invoice_number varchar(255) DEFAULT NULL,
                    invoince_status varchar(255) DEFAULT NULL,
                    stripe_invoice_id varchar(255) DEFAULT NULL,
                    created_at DATETIME DEFAULT NULL,
                    updated_at DATETIME DEFAULT NULL
                    )`
                );

                const [insert_migration, fields_insert_migration] =
                    await connectPool.query(`INSERT INTO migrations SET ?`, {
                        name: migration_name,
                    });
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new CreateInvoiceTable();
