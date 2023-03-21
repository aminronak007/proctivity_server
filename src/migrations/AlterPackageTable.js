class AlterPackageTable {
    constructor() {}

    async alter() {
        try {
            const migration_name = "AlterPackageTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE packages CHANGE package_features monthly_package_features VARCHAR(255) `
                );

                const [add_field, fields_add] = await connectPool.query(
                    `ALTER TABLE packages 
                  ADD yearly_package_features VARCHAR(255) AFTER monthly_package_features`
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

module.exports = new AlterPackageTable();
