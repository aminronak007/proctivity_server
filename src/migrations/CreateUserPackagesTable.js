class CreateUserPackagesTable {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreateUserPackagesTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [create, fields_create] = await connectPool.query(
                    `CREATE TABLE user_packages (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id int DEFAULT NULL,
                        package_id int DEFAULT NULL,
                        package_price decimal(8,2) DEFAULT NULL,
                        package_type varchar(25) DEFAULT NULL,
                        payment_type varchar(25) DEFAULT NULL,
                        created_at DATETIME DEFAULT NULL,
                        updated_at DATETIME DEFAULT NULL
                    )`
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

module.exports = new CreateUserPackagesTable();
