const dotenv = require("dotenv").config();

class CreatePackageTable {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreatePackageTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [create, fields_create] = await connectPool.query(
                    `CREATE TABLE packages (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        name varchar(255) DEFAULT NULL,
                        monthly_price decimal(8,2) DEFAULT NULL,
                        yearly_price decimal(8,2) DEFAULT NULL,
                        monthly_price_per_user decimal(8,2) DEFAULT NULL,
                        package_features varchar(255) DEFAULT NULL,
                        package_info text DEFAULT NULL,
                        is_free int DEFAULT NULL,
                        trial_days int DEFAULT NULL
                    )`
                );

                const [insert_packages, fields_insert_packages] =
                    await connectPool.query(`INSERT INTO packages SET ?`, [
                        {
                            name: "Free Trial",
                            monthly_price: 0,
                            is_free: 1,
                            trial_days: 14,
                        },
                    ]);

                const [insert_packages_2, fields_insert_packages_2] =
                    await connectPool.query(`INSERT INTO packages SET ?`, [
                        {
                            name: "Subscription",
                            monthly_price: 10,
                            yearly_price: 100,
                            is_free: 0,
                            monthly_price_per_user: 1,
                        },
                    ]);

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

module.exports = new CreatePackageTable();
