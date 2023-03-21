class CreateSettingsTable {
    constructor() {}
    async create() {
        try {
            const migration_name = "CreateSettingsTable";
            const [rows, fields] = await connectPool.query(
                `SELECT id FROM migrations WHERE name=?`,
                [migration_name]
            );
            if (rows.length == 0) {
                const [create_token, fields_create_token] =
                    await connectPool.query(
                        `CREATE TABLE settings (
            id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
            type varchar(50) NOT NULL,
            description longtext NOT NULL
        )`
                    );
                if (create_token) {
                    const [insert_row, fields] = await connectPool.query(
                        `INSERT INTO settings (type, description) VALUES ('terms_condition',"")`
                    );
                }
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

module.exports = new CreateSettingsTable();
