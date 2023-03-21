class AddStripeCredentialsUsersTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddStripeCredentialsUsersTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );
            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD stripe_public_key varchar(255) DEFAULT NULL,
                    ADD stripe_secret_key varchar(255) DEFAULT NULL`
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

module.exports = new AddStripeCredentialsUsersTable();
