const { getCurrentTime } = require("../helpers/helpers");
class CreateUserPermissionsTable {
    constructor() {}

    async create(prefix) {
        try {
            const migration_name = prefix + "CreateUserPermissionsTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = prefix + "user_permissions";

            if (rows.length == 0) {
                let [create, fields_create] = await connectPool.query(
                    `CREATE TABLE IF NOT EXISTS ` +
                        table_name +
                        ` (
                    id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    user_id int DEFAULT NULL,
                    module varchar(255) DEFAULT NULL,
                    access_permission int DEFAULT NULL,
                    edit_permission int DEFAULT NULL,
                    view_permission int DEFAULT NULL,
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

module.exports = new CreateUserPermissionsTable();
