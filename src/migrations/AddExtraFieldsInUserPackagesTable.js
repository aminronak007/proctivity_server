class AddExtraFieldsInUserPackagesTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddExtraFieldsInUserPackagesTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );
            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE user_packages 
                    ADD reference varchar(255) DEFAULT 'Subscription',
                    ADD sub_user_id int DEFAULT NULL`
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

module.exports = new AddExtraFieldsInUserPackagesTable();
