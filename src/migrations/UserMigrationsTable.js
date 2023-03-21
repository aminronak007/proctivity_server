const RunUserMigration = require("./RunUserMigration");
class UserMigrationsTable {
    constructor() {}

    async user_migrations() {
        let [result, fields] = await connectPool.query(
            "SELECT table_prefix FROM users WHERE parent = 0"
        );

        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                let row = result[i];
                await RunUserMigration.runuserMigration(row.table_prefix);
            }
        }
    }
}
module.exports = new UserMigrationsTable();
