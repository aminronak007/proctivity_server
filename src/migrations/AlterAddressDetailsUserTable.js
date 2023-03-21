class AlterAddressDetailsUserTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AlterAddressDetailsUserTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD address_line1 varchar(255) DEFAULT NULL AFTER expirydate,
                    ADD address_line2 varchar(255) DEFAULT NULL AFTER address_line1,
                    ADD postal_code varchar(255) DEFAULT NULL AFTER address_line2,
                    ADD city varchar(255) DEFAULT NULL AFTER postal_code,
                    ADD state varchar(255) DEFAULT NULL AFTER city`
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

module.exports = new AlterAddressDetailsUserTable();
