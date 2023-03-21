class AddCommissionSettingsTable {
    constructor() {}
    async alter() {
        try {
            const migration_name = "AddCommissionSettingsTable";
            const [rows, fields] = await connectPool.query(
                `SELECT id FROM migrations WHERE name=?`,
                [migration_name]
            );
            if (rows.length == 0) {
                const [insert_row, fields_create_token] =
                    await connectPool.query(
                        `INSERT INTO settings (type, description) VALUES ('commision_per_invoice',"0")`
                    );
                if (insert_row) {
                    const [insert_migration, fields_insert_migration] =
                        await connectPool.query(
                            `INSERT INTO migrations SET ?`,
                            {
                                name: migration_name,
                            }
                        );
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new AddCommissionSettingsTable();
