const dotenv = require("dotenv").config();

class CreateWebhookLogs {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreateWebhookLogs";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [create, fields_create] = await connectPool.query(
                    `CREATE TABLE webhook_logs (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        event varchar(255) DEFAULT NULL,
                        res text DEFAULT NULL
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

module.exports = new CreateWebhookLogs();
