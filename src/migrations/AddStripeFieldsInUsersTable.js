class AddStripeFieldsInUsersTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddStripeFieldsInUsersTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD stripe_customer_id varchar(255) DEFAULT NULL,
                    ADD payment_method_id varchar(255) DEFAULT NULL`
                );

                await connectPool.query(`INSERT INTO migrations SET ?`, {
                    name: migration_name,
                });
                // console.log(insert_migration);
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new AddStripeFieldsInUsersTable();
