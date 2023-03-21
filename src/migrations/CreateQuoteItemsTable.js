class CreateQuoteItemsTable {
    constructor() {}

    async create(prefix) {
        try {
            const migration_name = prefix + "CreateQuoteItemsTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = prefix + "quote_items";

            if (rows.length == 0) {
                let [create, fields_create] = await connectPool.query(
                    `CREATE TABLE IF NOT EXISTS ` +
                        table_name +
                        ` (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    customer_id INT DEFAULT NULL,
                    quote_id INT DEFAULT NULL,
                    item_name varchar(255) DEFAULT NULL,
                    item_price DECIMAL(8,2) DEFAULT NULL,
                    item_quantity DOUBLE DEFAULT NULL,
                    quote_line_item_id varchar(255) DEFAULT NULL,
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

module.exports = new CreateQuoteItemsTable();
