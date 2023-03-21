class AddStatusFieldInUserTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddStatusFieldInUserTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users ADD status ENUM('active','inactive') DEFAULT 'active'`
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

module.exports = new AddStatusFieldInUserTable();
