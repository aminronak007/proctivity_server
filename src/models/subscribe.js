const { getCurrentTime } = require("../helpers/helpers");
const auth_model = require("./auth");

class Subscribe {
  constructor() {}

  // Fetching user package details.
  async user_packge_subscription_info(subscription_id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT 
                    users.username,
                    user_packages.* 
                FROM 
                    user_packages
                LEFT JOIN users ON user_packages.user_id = users.id
                WHERE user_packages.subscription_id = ? AND user_packages.id = (SELECT max(id) as latest_package FROM user_packages WHERE user_packages.package_id = users.current_package_id AND user_packages.user_id = users.id  AND reference = 'Subscription') LIMIT 1`,
        [subscription_id]
      );

      if (rows_user.length === 1) {
        const package_info = rows_user[0];
        return package_info;
      } else {
        return [];
      }
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  // Renew Package.
  async renew_packge(subscription_id, invoice_amount, payment_type) {
    try {
      const result = await this.user_packge_subscription_info(subscription_id);
      invoice_amount = parseFloat(invoice_amount) / 100;
      if (result.length === 1) {
        const package_type = result.package_type;
        const user_id = result.user_id;
        const package_id = result.package_id;
        if (user_id != "" && user_id != null) {
          await auth_model.assignUserPackage(user_id, {
            user_id: user_id,
            package_id: package_id,
            package_price: invoice_amount,
            package_type: package_type,
            payment_type: payment_type,
            subscription_id: subscription_id,
            created_at: getCurrentTime(),
            updated_at: getCurrentTime(),
          });
        }
      }
      return result;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  async webhooklog(data, event) {
    try {
      const [insert_migration, fields_insert_migration] =
        await connectPool.query(`INSERT INTO webhook_logs SET ?`, {
          event: event,
          res: JSON.stringify(data),
        });
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update auto renewal of subscription.
  async updateAutoRenew(data) {
    try {
      const [rows, fields] = await connectPool.query(
        `UPDATE user_packages SET 
                autoRenew = ? 
                WHERE subscription_id = ? AND  reference = 'Subscription'`,
        [data.autoRenew, data.subscription_id]
      );
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new Subscribe();
