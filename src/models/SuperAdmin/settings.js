const Auth = require("../auth");
const { getCurrentTime, getLogo } = require("../../helpers/helpers");
const ExtendUserFreeTriallEmailTemplate = require("../../emailTemplates/ExtendUserFreeTriallEmailTemplate");
const EmailHandler = require("../../handlers/emailhandler");
const SendUserNotificationEmailTemplate = require("../../emailTemplates/SendUserNotificationEmailTemplate");

class SuperAdmin {
    constructor() {}

    async addUserFreeTrial(id) {
        try {
            const [check_user, check_fields] = await connectPool.query(
                `SELECT id,username,email FROM users WHERE id = ?`,
                [id]
            );

            if (check_user.length === 1) {
                const [check_package_trial, check_package_fields] =
                    await connectPool.query(
                        `SELECT * from user_packages WHERE user_id = ? AND package_type = "Trial"`,
                        [id]
                    );

                if (check_package_trial.length < 2) {
                    const assignFreeTrial = await Auth.assignUserPackage(id, {
                        user_id: id,
                        package_id: 1,
                        package_price: 0,
                        package_type: "Trial",
                        payment_type: "paid",
                        created_at: getCurrentTime(),
                        updated_at: getCurrentTime(),
                    });

                    let subject = "Free trial Extended";
                    let msg = await ExtendUserFreeTriallEmailTemplate.MailSent({
                        username: check_user[0].username,
                    });

                    let result = await EmailHandler.sendEmail(
                        check_user[0].email,
                        msg,
                        subject,
                        "",
                        getLogo()
                    );

                    if (result) {
                        return result;
                    } else {
                        return assignFreeTrial;
                    }
                }
                return check_package_trial;
            }
            return check_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async sendUserCustomNotifications(input) {
        try {
            let i = 0;
            let subject = "Proctivity Notifications";
            let data = [];
            while (i < input.ids.length) {
                let msg = await SendUserNotificationEmailTemplate.MailSent({
                    username: input.ids[i].label,
                    text: input.text,
                });

                let result = await EmailHandler.sendEmail(
                    input.ids[i].email,
                    msg,
                    subject,
                    "",
                    getLogo()
                );
                data.push(input.ids[i]);
                i++;
            }

            if (input.ids.length === data.length) {
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getAllUsers() {
        try {
            const [rows_users, fields] = await connectPool.query(
                `SELECT id,username,email from users WHERE parent = 0 AND role != "Super Admin"`
            );

            let data = [];

            let i = 0;
            while (i < rows_users.length) {
                await data.push({
                    value: rows_users[i].id,
                    label: rows_users[i].username,
                    email: rows_users[i].email,
                });
                i++;
            }

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getFreeTrialRequests() {
        try {
            const [rows_users, fields] = await connectPool.query(
                `SELECT id,username,email,phone from users WHERE parent = 0 AND role != "Super Admin" AND is_request = 1`
            );
            return rows_users;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async cancelFreeTrialRequests(req) {
        try {
            const [rows_users, fields] = await connectPool.query(
                `UPDATE users SET is_request = 2 where id = ?`,
                [req.params.id]
            );
            return rows_users;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async termsAndCondition(input) {
        try {
            const [rows, fields] = await connectPool.query(
                `UPDATE settings SET description = ? WHERE type = "terms_condition"`,
                [input.text]
            );
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getTermsAndCondition(input) {
        try {
            const [rows, fields] = await connectPool.query(
                `SELECT description FROM settings WHERE type = "terms_condition"`
            );
            return rows[0];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async setCommissionPerInvoice(input) {
        try {
            const [rows, fields] = await connectPool.query(
                `UPDATE settings SET description = ? WHERE type = "commision_per_invoice"`,
                [input.commision_per_invoice]
            );
            return rows;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getCommisionPerInvoice(input) {
        try {
            const [rows, fields] = await connectPool.query(
                `SELECT description FROM settings WHERE type = "commision_per_invoice"`
            );
            return rows[0];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
}

module.exports = new SuperAdmin();
