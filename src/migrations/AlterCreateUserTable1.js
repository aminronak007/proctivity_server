class AlterCreateUserTable1 {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AlterCreateUserTable1";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
          MODIFY created_at DATETIME DEFAULT NULL,
          MODIFY updated_at DATETIME DEFAULT NULL`
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

module.exports = new AlterCreateUserTable1();
