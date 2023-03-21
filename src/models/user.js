const fs = require("fs");
const {
    getCurrentTime,
    generatePassword,
    getLogo,
    encryptPlainText,
} = require("../helpers/helpers");
const bcrypt = require("bcryptjs");

const bcriptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const SendAccessKeyEmailTemplate = require("../emailTemplates/SendAccessKeyEmailTemplate");
const emailhandler = require("../handlers/emailhandler");
const SubUserAccountStatusEmailTemplate = require("../emailTemplates/SubUserAccountStatusEmailTemplate");
const { unlinkFiles } = require("../helpers/helpers");

class User {
    constructor() {}

    // Update user profile by user id.
    async editProfile(id, input, filename) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id,phone,logo FROM users WHERE id = ? LIMIT 1`,
                [id]
            );

            if (rows_user.length === 1) {
                const [checkPhone, checkPhoneFields] = await connectPool.query(
                    `SELECT id, phone from users WHERE phone = ? LIMIT 1`,
                    [input.phone]
                );
                if (
                    checkPhone.length === 0 ||
                    (checkPhone.length === 1 &&
                        checkPhone[0].id === rows_user[0].id)
                ) {
                    let number =
                        (await input.phone.length) === 9
                            ? "0" + input.phone
                            : input.phone;
                    const [rows, fields] = await connectPool.query(
                        `UPDATE users SET 
              username = '${input.username}', 
              companyname = '${input.companyname}', 
              phone = '${number}', 
              brandcolor = '${input.brandcolor}',
              logo = '${filename}',
              updated_at = '${getCurrentTime()}',
              address_line1 = '${input.address_line1}',
              address_line2 = '${input.address_line2}',
              postal_code = '${input.postal_code}',
              city = '${input.city}',
              state = '${input.state}'
              WHERE users.id = ?`,
                        [id]
                    );

                    if (filename !== rows_user[0].logo) {
                        await unlinkFiles(
                            `${process.env.UPLOAD_DIR}/${rows_user[0].logo}`
                        );
                    }

                    return rows;
                }
                return checkPhone;
            }

            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update user password by user id.
    async changePassword(id, input) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id,access_key_send, password from users WHERE id = ? LIMIT 1`,
                [id]
            );
            if (rows_user.length === 1) {
                const sql_update = rows_user[0].access_key_send
                    ? "access_key_send = 0,"
                    : "";
                const checkPassword = await bcrypt.compare(
                    input.currentpassword,
                    rows_user[0].password
                );

                if (checkPassword) {
                    const newpassword = await bcrypt.hash(input.newpassword, 8);
                    const [rows, fields] = await connectPool.query(
                        `UPDATE users SET 
              password = '${newpassword}',
              ${sql_update} 
              updated_at = '${getCurrentTime()}'              
              WHERE users.id = ?`,
                        [id]
                    );
                }
                let data = { checkPassword };
                return data;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update user Card Details.
    async updateCardDetails(id, input) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id from users WHERE id = ? LIMIT 1`,
                [id]
            );

            if (rows_user.length === 1) {
                const [rows, updateFields] = await connectPool.query(
                    `UPDATE users SET 
                    cardname = ?,
                    cardnumber = ?,
                    cvv = ?,
                    expirydate = ?
                    WHERE users.id = ?`,
                    [
                        encryptPlainText(input.cardname),
                        encryptPlainText(input.cardnumber),
                        encryptPlainText(input.cvv),
                        encryptPlainText(input.expirydate),
                        id,
                    ]
                );
                return rows;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update User Stripe Settings.
    async updateStripeSettings(id, input) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id from users WHERE id = ? LIMIT 1`,
                [id]
            );
            if (rows_user.length === 1) {
                const [rows, updateFields] = await connectPool.query(
                    `UPDATE users SET 
                    payment_method_id = '${input.payment_method_id}',
                    stripe_customer_id = '${input.stripe_customer_id}'
                    WHERE users.id = ?`,
                    [id]
                );
                return rows;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all the user details.
    async getUserFullDetails(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT * from users WHERE id = ?`,
                [id]
            );

            if (rows_user.length > 0) {
                let user = rows_user[0];
                user.logoPath = `${process.env.UPLOAD_DIR}/${user.logo}`;

                if (user.parent === 0) {
                    if (user.id !== 1) {
                        user.package = await this.packageinfo(user.id);
                    }
                } else {
                    let new_user = await this.getUserDetails(user.parent);
                    new_user.username = user.username;
                    new_user.email = user.email;
                    new_user.phone = user.phone;
                    new_user.role = user.role;
                    new_user.id = user.id;
                    new_user.parent = user.parent;
                    new_user.created_at = user.created_at;
                    new_user.updated_at = user.updated_at;
                    new_user.password = user.password;
                    new_user.access_key_send = user.access_key_send;
                    new_user.logoPath = `${process.env.UPLOAD_DIR}/${new_user.logo}`;
                    new_user.package = await this.packageinfo(user.parent);
                    user = new_user;
                }
                if (user.id !== 1) {
                    user.permissions = await this.GetUserPermissionsOnly({
                        table_prefix: user.table_prefix,
                        user_id: user.id,
                    });
                }

                return user;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching single User details by its id.
    async getUserDetails(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT * from users WHERE id = ?`,
                [id]
            );

            if (rows_user.length > 0) {
                const user = rows_user[0];
                return user;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all user packages.
    async getUserPackageDetails(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT user_packages.*, packages.name,users.is_delete as user_deleted_or_not from user_packages 
                LEFT JOIN packages ON packages.id = user_packages.package_id
                LEFT JOIN users ON users.id = user_packages.sub_user_id
                WHERE user_id = ? AND packages.id = user_packages.package_id ORDER BY id DESC`,
                [id]
            );

            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update User address details.
    async editUserAddress(id, input) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id FROM users WHERE id = ? LIMIT 1`,
                [id]
            );

            if (rows_user.length === 1) {
                const [rows, fields] = await connectPool.query(
                    `UPDATE users SET 
              address_line1 = '${input.address_line1}',
              address_line2 = '${input.address_line2}',
              postal_code = '${input.postal_code}',
              city = '${input.city}',
              state = '${input.state}',
              updated_at = '${getCurrentTime()}'
    
              WHERE users.id = ?`,
                    [id]
                );

                return rows;
            }

            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Add new Subuser.
    async register_sub_user(input, id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                "SELECT email,phone FROM users WHERE email = ? or phone = ? LIMIT 1",
                [input.email, input.phone]
            );

            if (rows_user.length === 0) {
                let hashed_password = await bcriptjs.hash("123456789", 8);
                let number =
                    (await input.phone.length) === 9
                        ? "0" + input.phone
                        : input.phone;

                let data = {
                    username: input.username,
                    email: input.email,
                    phone: number,
                    password: hashed_password,
                    created_at: getCurrentTime(),
                    updated_at: getCurrentTime(),
                    role: input.role,
                    parent: id,
                };
                const [rows, fields] = await connectPool.query(
                    "INSERT INTO users set ? ",
                    data
                );

                return rows;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update Subuser details.
    async update_sub_user(input, id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                "SELECT email,phone FROM users WHERE (email = ? or phone = ?) and id != ? LIMIT 1",
                [input.email, input.phone, id]
            );

            if (rows_user.length === 0) {
                const [rows_user, fields] = await connectPool.query(
                    `SELECT id from users WHERE id = ? LIMIT 1`,
                    [id]
                );

                if (rows_user.length === 1) {
                    let number =
                        (await input.phone.length) === 9
                            ? "0" + input.phone
                            : input.phone;
                    const [rows, updateFields] = await connectPool.query(
                        `UPDATE users SET 
                    username = '${input.username}',
                    email = '${input.email}',
                    role = '${input.role}',
                    phone = '${number}'
                    WHERE users.id = ?`,
                        [id]
                    );
                    return rows;
                }
            } else {
                throw new Error("Email or password is already exist");
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete Subuser by its id.
    async delete_sub_user(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `UPDATE users SET is_delete = 1 WHERE id = ?`,
                [id]
            );
            if (rows_user) {
                const [delete_token, fields] = await connectPool.query(
                    `DELETE from  users_token WHERE user_id = ?`,
                    [id]
                );

                return delete_token;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
    // Fetching all Subuser list.
    async GetAllSubUsers(id, input) {
        try {
            let search = input.search ? input.search : "";
            let offset = (input.page - 1) * input.limit;
            var searchString = input.search
                ? `and (username LIKE '%${search}%' OR role LIKE '%${search}%' OR email LIKE '%${search}%' OR phone LIKE '%${search}%')`
                : "";

            const [rows_user, fields] = await connectPool.query(
                `SELECT * from users WHERE parent = ? AND is_delete = 0 ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`,
                [id]
            );

            let count = "";

            count = await connectPool.query(
                `SELECT COUNT(id) as totalRecords from users WHERE parent = ? AND is_delete = 0 ${searchString}`,
                [id]
            );

            let totalRecords = await count[0][0]?.totalRecords;

            let data = {
                users: rows_user,
                totalRecords: totalRecords,
            };

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching user package details function.
    async packageinfo(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT 
                    packages.*,
                    user_packages.package_price,
                    user_packages.package_type,
                    user_packages.payment_type,
                    user_packages.created_at,
                    user_packages.subscription_id,
                    user_packages.autoRenew,
                    user_packages.id as user_package_id 
                FROM 
                    users
                LEFT JOIN user_packages ON user_packages.package_id = users.current_package_id
                LEFT JOIN packages ON packages.id = users.current_package_id
                WHERE users.id = ? AND user_packages.id = (SELECT max(id) as latest_package FROM user_packages WHERE user_packages.package_id = users.current_package_id AND user_packages.user_id = users.id  AND reference = 'Subscription') LIMIT 1`,
                [id]
            );

            if (rows_user.length === 1) {
                let package_info = rows_user[0];

                const package_type = package_info.package_type;
                const created_at = package_info.created_at;
                const trial_days = package_info.trial_days;
                const current_time = getCurrentTime();
                const now = moment(current_time, "YYYY-MM-DD HH:mm:ss");
                const package_date = moment(created_at, "YYYY-MM-DD HH:mm:ss");
                let difference_in_days = 0;
                let expired = false;
                let package_expiry_date = null;

                if (package_type === "Trial") {
                    const package_date_moment = package_date.add(
                        trial_days,
                        "days"
                    );
                    package_expiry_date = package_date_moment.format(
                        "YYYY-MM-DD HH:mm:ss"
                    );
                    difference_in_days = package_date_moment.diff(now, "days");
                    if (difference_in_days <= 0) {
                        expired = true;
                    }
                } else if (package_type === "Monthly") {
                    const package_date_moment = package_date.add(1, "month");
                    package_expiry_date = package_date_moment.format(
                        "YYYY-MM-DD HH:mm:ss"
                    );
                    difference_in_days = package_date_moment.diff(now, "days");
                    if (difference_in_days <= 0) {
                        expired = true;
                    }
                } else if (package_type === "Yearly") {
                    const package_date_moment = package_date.add(1, "year");
                    package_expiry_date = package_date_moment.format(
                        "YYYY-MM-DD HH:mm:ss"
                    );
                    difference_in_days = package_date_moment.diff(now, "days");
                    if (difference_in_days <= 0) {
                        expired = true;
                    }
                }
                if (package_info.payment_type !== "paid") {
                    expired = true;
                }
                package_info.package_expiry_date = package_expiry_date;
                package_info.expired = expired;
                package_info.difference_in_days = difference_in_days;
                return package_info;
            } else {
                return [];
            }
        } catch (e) {
            console.log(e);
            throw Error(e);
        }
    }

    // Adding or Updating user permissions.
    async add_or_update_user_permission(payload) {
        try {
            const table_name = payload.table_prefix + "user_permissions";
            const [rows_user, fields] = await connectPool.query(
                `SELECT * from ` +
                    table_name +
                    ` WHERE user_id = ? AND module = ?`,
                [payload.user_id, payload.module]
            );

            if (rows_user.length == 0) {
                let data = {
                    user_id: payload.user_id,
                    module: payload.module,
                    view_permission: payload.view_permission,
                    access_permission: payload.access_permission,
                    edit_permission: payload.edit_permission,
                    created_at: getCurrentTime(),
                    updated_at: getCurrentTime(),
                };
                const [rows, fields] = await connectPool.query(
                    "INSERT INTO " + table_name + " set ? ",
                    data
                );
            } else {
                const [rows, updateFields] = await connectPool.query(
                    `UPDATE ` +
                        table_name +
                        ` SET 
                    view_permission = '${payload.view_permission}',
                    access_permission = '${payload.access_permission}',
                    edit_permission = '${payload.edit_permission}',
                    updated_at = '${getCurrentTime()}'
                    WHERE user_id = ? AND module = ?`,
                    [payload.user_id, payload.module]
                );
                return rows;
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all User permissions.
    async GetUserPermissions(payload) {
        try {
            const table_name = payload.table_prefix + "user_permissions";
            const [rows_user, fields] = await connectPool.query(
                `SELECT ` +
                    table_name +
                    `.*,modules.name,modules.module_code from modules LEFT JOIN ` +
                    table_name +
                    ` ON modules.module_code =  ` +
                    table_name +
                    `.module   AND  user_id = ? WHERE modules.hide_for_permissions = 0`,
                [payload.user_id]
            );
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching user permissions by user id.
    async GetUserPermissionsOnly(payload) {
        try {
            const table_name = payload.table_prefix + "user_permissions";
            const [rows_user, fields] = await connectPool.query(
                `SELECT * from ` + table_name + ` WHERE  user_id = ?`,
                [payload.user_id]
            );
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all User group permission.
    async GetUserGroupPermissions(groups, payload) {
        try {
            const table_prefix = payload.table_prefix;
            const table_name = table_prefix + "user_permissions";
            for (let i = 0; i < groups.length; i++) {
                let group = groups[i];
                groups[i].access_permission = null;
                groups[i].edit_permission = null;
                groups[i].view_permission = null;
                let child = group.child;

                let [rows_user, fields] = await connectPool.query(
                    `SELECT * FROM ${table_name} WHERE module = ? AND user_id = ?`,
                    [group.module_code, payload.user_id]
                );

                if (rows_user.length > 0) {
                    let permission = rows_user[0];
                    groups[i].access_permission = permission.access_permission;
                    groups[i].edit_permission = permission.edit_permission;
                    groups[i].view_permission = permission.view_permission;
                }

                for (let c = 0; c < child.length; c++) {
                    let sub_group = child[c];
                    sub_group.access_permission = null;
                    sub_group.edit_permission = null;
                    sub_group.view_permission = null;
                    let [rows_user, fields] = await connectPool.query(
                        `SELECT * FROM ${table_name} WHERE module = ? AND user_id = ?`,
                        [sub_group.module_code, payload.user_id]
                    );

                    if (rows_user.length > 0) {
                        let permission = rows_user[0];
                        sub_group.access_permission =
                            permission.access_permission;
                        sub_group.edit_permission = permission.edit_permission;
                        sub_group.view_permission = permission.view_permission;
                    }
                    groups[i].child[c] = sub_group;
                }
            }
            return groups;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Sending Access key (i.e.: Email and password) to subusers.
    async sendAccessKey(id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                `SELECT id,username,email from users WHERE id = ? LIMIT 1`,
                [id]
            );

            if (rows_user.length === 1) {
                let token = jwt.sign({ id: rows_user[0].id }, "user", {
                    expiresIn: "1d",
                });
                let resetLink = `${process.env.domainURL}/login`;

                let subject = "Login Credentials";
                let password = generatePassword();
                const msg = await SendAccessKeyEmailTemplate.MailSent({
                    username: rows_user[0].username,
                    email: rows_user[0].email,
                    resetLink: resetLink,
                    password: password,
                });

                var result = await emailhandler.sendEmail(
                    rows_user[0].email,
                    msg,
                    subject,
                    "",
                    getLogo()
                );

                let newpassword = await bcriptjs.hash(password, 8);
                const [rows, fields] = await connectPool.query(
                    `UPDATE users SET 
                        password = '${newpassword}',
                        access_key_send = ? ,          
                        updated_at = '${getCurrentTime()}'
                        WHERE users.id = ? `,
                    [1, rows_user[0].id]
                );

                if (rows) {
                    const [delete_user_tokens, delete_fields] =
                        await connectPool.query(
                            `DELETE from users_token where user_id = ?`,
                            [id]
                        );
                }
                return rows;
            }
            return rows_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update Subuser active/deactive status.
    async updateUserStatus(req) {
        try {
            let input = req.body;
            const [rows_users, fields] = await connectPool.query(
                `SELECT id,username,email,status from users WHERE id = ?`,
                [input.id]
            );

            if (rows_users.length !== 0) {
                const [update_user_status] = await connectPool.query(
                    `UPDATE users SET status = ?, updated_at = ? WHERE id = ?`,
                    [input.status, getCurrentTime(), input.id]
                );

                if (update_user_status) {
                    let subject =
                        input.status === "inactive"
                            ? "Account Deactivated"
                            : "Account Activated";

                    let account_status =
                        input.status === "inactive"
                            ? "deactivated"
                            : "activated";

                    const msg =
                        await SubUserAccountStatusEmailTemplate.MailSent({
                            username: rows_users[0].username,
                            account_status: account_status,
                        });

                    let result = await emailhandler.sendEmail(
                        rows_users[0].email,
                        msg,
                        subject,
                        "",
                        getLogo()
                    );
                    const [delete_user_token, delete_fields] =
                        await connectPool.query(
                            "DELETE FROM users_token WHERE user_id = ?",
                            [input.id]
                        );

                    return update_user_status;
                }
            }

            return rows_users;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetcing all Main Users (Admin) details.
    async GetAllMainUsers(input) {
        try {
            let search = input.search ? input.search : "";
            let offset = (input.page - 1) * input.limit;
            var searchString = input.search
                ? `and (username LIKE '%${search}%' OR role LIKE '%${search}%' OR email LIKE '%${search}%' OR phone LIKE '%${search}%')`
                : "";

            let main_conditions = ` parent = 0 AND is_delete = 0 AND role != 'Super Admin'`;
            const [rows_user, fields] = await connectPool.query(
                `SELECT * from users WHERE ${main_conditions} ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`
            );

            let count = "";
            if (input.search) {
                count = await connectPool.query(
                    `SELECT COUNT(id) as totalRecords from users WHERE ${main_conditions} ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`
                );
            } else {
                count = await connectPool.query(
                    `SELECT COUNT(id) as totalRecords from users WHERE ${main_conditions}`
                );
            }

            let totalRecords = await count[0][0]?.totalRecords;

            let users = [];
            if (rows_user.length > 0) {
                for (let i = 0; i < rows_user.length; i++) {
                    let r_u = rows_user[i];
                    r_u.package = await this.packageinfo(r_u.id);
                    users.push(r_u);
                }
            }
            let data = {
                users: users,
                totalRecords: totalRecords,
            };

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async get_subscription_item_id(user_id) {
        try {
            const [rows_user, fields] = await connectPool.query(
                "SELECT subscription_item_id FROM users WHERE parent = ? AND subscription_item_id IS NOT null LIMIT 1",
                [user_id]
            );

            if (rows_user.length === 0) {
                return [];
            }
            return rows_user[0];
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async requestFreeTrial(input) {
        try {
            let user_id = input.user_id;
            const [check_user, check_fields] = await connectPool.query(
                `SELECT id from users WHERE id = ? AND is_request = 0`,
                [user_id]
            );

            if (check_user.length === 1) {
                const [update_add_free_trial, field] = await connectPool.query(
                    `UPDATE users SET is_request = 1 WHERE id = ?`,
                    [user_id]
                );
                return update_add_free_trial;
            }

            return check_user;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async UpdateStripeDetails(id, payload) {
        const [rows, updateFields] = await connectPool.query(
            `UPDATE users SET 
                    stripe_public_key = ?,
                    stripe_secret_key = ?
                    WHERE users.id = ?`,
            [payload.stripe_public_key, payload.stripe_secret_key, id]
        );
    }
}

module.exports = new User();
