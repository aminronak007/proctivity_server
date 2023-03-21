const { getCurrentTime } = require("../helpers/helpers");
class AddStripeCustomerIdInCustomerEntryTable {
    constructor() {}

    async alter(prefix) {
        try {
            const migration_name =
                prefix + "AddStripeCustomerIdInCustomerEntryTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            let table_name = prefix + "customer_entries";

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE ` +
                        table_name +
                        ` ADD stripe_customer_id varchar(255) DEFAULT NULL,
                          ADD city varchar(255) DEFAULT NULL,
                          ADD country varchar(255) DEFAULT NULL,
                          ADD state varchar(255) DEFAULT NULL`
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

module.exports = new AddStripeCustomerIdInCustomerEntryTable();
