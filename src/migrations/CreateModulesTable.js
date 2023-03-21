const dotenv = require("dotenv").config();

class CreateModulesTable {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreateModulesTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [create, fields_create] = await connectPool.query(
                    `CREATE TABLE modules (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        name varchar(255) DEFAULT NULL,
                        module_code varchar(255) DEFAULT NULL,
                        hide_for_menu int DEFAULT NULL,
                        hide_for_permissions int DEFAULT NULL
                    )`
                );

                let [modules, fields_insert_packages] = await connectPool.query(
                    `INSERT INTO modules (name, module_code,hide_for_menu,hide_for_permissions) VALUES ?`,
                    [
                        [
                            ["Home", "home", 0, 0],
                            ["General Settings", "general_settings", 0, 0],
                            ["Subscription", "subscription", 0, 1],
                            ["Marketing Data", "marketing_data", 0, 0],
                            [
                                "Marketing Data List",
                                "marketing_data_list",
                                0,
                                0,
                            ],
                            ["Users", "users", 0, 1],
                            ["Groups", "groups", 0, 0],
                            ["Group Status", "group_status", 0, 0],
                            ["Workflow", "work", 0, 0],
                            ["Calendar", "calendar", 0, 0],
                        ],
                    ]
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

module.exports = new CreateModulesTable();
