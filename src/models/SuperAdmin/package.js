class Package {
    constructor() {}

    // Fetching all the packages details.
    async get_package() {
        try {
            const [rows_package, fields] = await connectPool.query(
                `SELECT * FROM packages WHERE id = 2 LIMIT 1`
            );
            return rows_package[0];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update each package details by its id.
    async editPackage(input) {
        try {
            const [rows, fields] = await connectPool.query(
                `UPDATE packages SET 
                name = ?, 
                monthly_price = ?,
                yearly_price = ?,
                monthly_price_per_user = ? ,
                trial_days = ? 
                WHERE id = 2`,
                [
                    input.name,
                    input.monthly_price,
                    input.yearly_price,
                    input.monthly_price_per_user,
                    input.trial_days,
                ]
            );
            const [rows_p1, fields_p1] = await connectPool.query(
                `UPDATE packages SET 
                trial_days = ?
                WHERE id = 1`,
                [input.trial_days]
            );
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all on Going Subscriptions details by package id and type.
    async getOngoingSubscriptions(type) {
        try {
            const [rows_subscription, fields] = await connectPool.query(
                `SELECT MAX(id),user_id,subscription_id 
                FROM user_packages 
                WHERE package_id="2" AND 
                package_type=? AND 
                payment_type="paid" GROUP BY user_id`,
                type
            );
            return rows_subscription;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
}

module.exports = new Package();
