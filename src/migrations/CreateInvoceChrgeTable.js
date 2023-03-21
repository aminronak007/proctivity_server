class CreateInvoceChrgeTable {
    constructor() {}
    async create() {
        try {
            const migration_name = "CreateInvoceChrgeTable";
            const [rows, fields] = await connectPool.query(
                `SELECT id FROM migrations WHERE name=?`,
                [migration_name]
            );
            if (rows.length == 0) {
                const [create_token, fields_create_token] =
                    await connectPool.query(
                        `CREATE TABLE invoice_charges (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id int NOT NULL,
                        amount varchar(255) NOT NULL,
                        invoice_id varchar(255) NOT NULL,
                        table_prefix varchar(255) NOT NULL,
                        resp text NOT NULL,
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

module.exports = new CreateInvoceChrgeTable();
