class AlterPhoneFieldUserTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AlterPhoneFieldUserTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users MODIFY phone VARCHAR(255) DEFAULT NULL`
                );

                await connectPool.query(`INSERT INTO migrations SET ?`, {
                    name: migration_name,
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new AlterPhoneFieldUserTable();
