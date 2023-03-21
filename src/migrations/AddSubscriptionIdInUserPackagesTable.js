class AddSubscriptionIdInUserPackagesTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddSubscriptionIdInUserPackagesTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE user_packages 
                    ADD subscription_id varchar(255) DEFAULT NULL`
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

module.exports = new AddSubscriptionIdInUserPackagesTable();
