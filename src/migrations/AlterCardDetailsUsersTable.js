class AlterCardDetailsUsersTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AlterCardDetailsUsersTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD card_name varchar(255) DEFAULT NULL AFTER current_package_id,
                    ADD card_number varchar(255) DEFAULT NULL AFTER card_name,
                    ADD cvv varchar(255) DEFAULT NULL AFTER card_number,
                    ADD expiry_date varchar(255) DEFAULT NULL AFTER cvv`
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

module.exports = new AlterCardDetailsUsersTable();
