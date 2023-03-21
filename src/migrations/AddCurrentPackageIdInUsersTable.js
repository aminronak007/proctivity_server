class AddCurrentPackageIdInUsersTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AddCurrentPackageIdInUsersTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );
            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD current_package_id int DEFAULT NULL AFTER password`
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

module.exports = new AddCurrentPackageIdInUsersTable();
