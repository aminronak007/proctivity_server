class AddWebhookIdAndProctivityAccountIdUsersTable {
    constructor() {}

    async alter() {
        try {
            const migration_name =
                "AddWebhookIdAndProctivityAccountIdUsersTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );
            if (rows.length == 0) {
                const [alter, fields_alter] = await connectPool.query(
                    `ALTER TABLE users 
                    ADD webhook_id varchar(255) DEFAULT NULL,
                    ADD proctivity_connected_account_id varchar(255) DEFAULT NULL`
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

module.exports = new AddWebhookIdAndProctivityAccountIdUsersTable();
