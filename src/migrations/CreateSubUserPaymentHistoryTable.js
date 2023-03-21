const { getCurrentTime } = require("../helpers/helpers");
class CreateSubUserPaymentHistoryTable {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreateSubUserPaymentHistoryTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = "sub_user_payment_history";

            if (rows.length == 0) {
                let [create, fields_create] = await connectPool.query(
                    `CREATE TABLE IF NOT EXISTS ` +
                        table_name +
                        ` (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id int DEFAULT NULL,
                        resp text DEFAULT NULL,
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

module.exports = new CreateSubUserPaymentHistoryTable();
