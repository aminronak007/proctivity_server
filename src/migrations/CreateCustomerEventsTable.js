const { getCurrentTime } = require("../helpers/helpers");
class CreateCustomerEventsTable {
    constructor() {}

    async create(prefix) {
        try {
            const migration_name = prefix + "CreateCustomerEventsTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = prefix + "customer_events";

            if (rows.length == 0) {
                let [create, fields_create] = await connectPool.query(
                    `CREATE TABLE IF NOT EXISTS ` +
                        table_name +
                        ` (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    customer_id INT DEFAULT NULL,
                    user_id INT DEFAULT NULL,
                    title VARCHAR(255) DEFAULT NULL,
                    event_desc text DEFAULT NULL,
                    start_date DATETIME DEFAULT NULL,
                    end_date DATETIME DEFAULT NULL,
                    event_color  VARCHAR(255) DEFAULT NULL,
                    recurring_event VARCHAR(255) DEFAULT NULL,
                    created_at DATETIME DEFAULT NULL,
                    updated_at DATETIME DEFAULT NULL,
                    added_by INT DEFAULT NULL,
                    updated_by INT DEFAULT NULL
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

module.exports = new CreateCustomerEventsTable();
