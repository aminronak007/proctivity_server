const bcriptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getCurrentTime, getLogo } = require("../helpers/helpers");
const EmailHandler = require("../handlers/emailhandler");
const RunUserMigration = require("../migrations/RunUserMigration");
const RegisterEmailTemplate = require("../emailTemplates/RegisterEmailTemplate");
const ResetPasswordTemplate = require("../emailTemplates/ResetPasswordTemplate");
const UserModel = require("./user");

class Auth {
  constructor() {}
  async register(input, filename) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT email,phone,username FROM users WHERE email = ? or phone = ? LIMIT 1",
        [input.email, input.phone]
      );

      if (rows_user.length === 0) {
        let hashed_password = await bcriptjs.hash(input.password, 8);
        let number =
          (await input.phone.length) === 9 ? "0" + input.phone : input.phone;

        let data = {
          username: input.username,
          companyname: input.companyname,
          email: input.email,
          phone: number,
          brandcolor: "#ffffff",
          password: hashed_password,
          logo: filename,
          address_line1: input.address_line1,
          state: input.state,
          city: input.city,
          postal_code: input.postal_code,
          created_at: getCurrentTime(),
          updated_at: getCurrentTime(),
          role: "Admin",
          parent: 0,
        };
        const [rows, fields] = await connectPool.query(
          "INSERT INTO users set ? ",
          data
        );
        await this.update_prefix(rows.insertId);
        await this.assignUserPackage(rows.insertId, {
          user_id: rows.insertId,
          package_id: 1,
          package_price: 0,
          package_type: "Trial",
          payment_type: "paid",
          created_at: getCurrentTime(),
          updated_at: getCurrentTime(),
        });

        let subject = "Registration Successful";
        let msg = await RegisterEmailTemplate.MailSent({
          username: data.username,
        });

        let result = await EmailHandler.sendEmail(
          input.email,
          msg,
          subject,
          "",
          getLogo()
        );
        if (result) {
          return result;
        }
        return rows;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async login(input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT * FROM users WHERE email = ? AND role != 'Super Admin' LIMIT 1",
        [input.email]
      );
      // console.log(rows_user);
      if (
        rows_user.length > 0 &&
        rows_user[0]?.status === "active" &&
        rows_user[0].is_delete === 0
      ) {
        let user = rows_user[0];
        const password = user.password;
        const isMatch = await bcriptjs.compare(input.password, password);
        if (!isMatch) {
          return [];
        }
        const token = await jwt.sign({ id: user.id }, "users");
        const [row_token, fields] = await connectPool.query(
          "INSERT INTO users_token SET ?",
          {
            user_id: user.id,
            token: token,
          }
        );

        user = await UserModel.getUserFullDetails(user.id);
        user.token = token;

        return user;
      }
      return rows_user;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  async login_as(id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT * FROM users WHERE id = ?  AND role != 'Super Admin' LIMIT 1",
        [id]
      );
      // console.log(rows_user);
      if (
        rows_user.length > 0 &&
        rows_user[0]?.status === "active" &&
        rows_user[0].is_delete === 0
      ) {
        let user = rows_user[0];
        const token = await jwt.sign({ id: user.id }, "users");
        const [row_token, fields] = await connectPool.query(
          "INSERT INTO users_token SET ?",
          {
            user_id: user.id,
            token: token,
          }
        );

        user = await UserModel.getUserFullDetails(user.id);
        user.token = token;
        return user;
      }
      return [];
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  async super_login(input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT * FROM users WHERE email = ? AND role = 'Super Admin' LIMIT 1",
        [input.email]
      );

      if (rows_user.length > 0) {
        let user = rows_user[0];
        const password = user.password;
        const isMatch = await bcriptjs.compare(input.password, password);

        if (!isMatch) {
          return [];
        }
        const token = await jwt.sign({ id: user.id }, "users");
        const [row_token, fields] = await connectPool.query(
          "INSERT INTO users_token SET ?",
          {
            user_id: user.id,
            token: token,
          }
        );

        user.token = token;

        return user;
      }
      return [];
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }
  async logout(input) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "DELETE FROM users_token WHERE user_id = ? AND token = ?",
        [input.id, input.token]
      );
      return rows_user;
    } catch (e) {
      throw Error(e);
    }
  }

  async update_prefix(id) {
    try {
      const [rows_user, fields] = await connectPool.query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [id]
      );

      if (rows_user.length === 1) {
        const table_prefix = "user_" + id + "_";
        const [rows, fields] = await connectPool.query(
          `UPDATE 
                        users 
                    SET 
                        table_prefix = '${table_prefix}' 
                    WHERE 
                        users.id = ?`,
          [id]
        );
        await RunUserMigration.runuserMigration(table_prefix);
      }
    } catch (e) {
      throw Error(e);
    }
  }

  async assignUserPackage(id, payload) {
    try {
      const [row_token, fields] = await connectPool.query(
        "INSERT INTO user_packages SET ?",
        payload
      );

      const [rows, fields_insert] = await connectPool.query(
        `UPDATE 
                        users 
                    SET 
                        current_package_id = '${payload.package_id}' ,
                        is_request = 0
                    WHERE 
                        users.id = ?`,
        [id]
      );
      return true;
    } catch (e) {
      throw Error(e);
    }
  }

  async CancelUserPackage(payload) {
    try {
      const [row_cancel_subscription, cancel_fields] = await connectPool.query(
        `UPDATE 
                        user_packages 
                    SET 
                        payment_type = 'cancel' 
                    WHERE 
                        id = ?`,
        [payload.user_package_id]
      );

      let [rows, fields_insert] = await connectPool.query(
        `UPDATE 
                        users 
                    SET 
                        current_package_id = NULL
                    WHERE 
                        users.id = ?`,
        [payload.user_id]
      );

      [rows, fields_insert] = await connectPool.query(
        `UPDATE 
                        users 
                    SET 
                        subscription_item_id = NULL
                    WHERE 
                        users.parent = ?`,
        [payload.user_id]
      );
    } catch (e) {
      throw Error(e);
    }
  }

  async forgotPassword(email) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT email,id,username from users WHERE email = ? LIMIT 1`,
        [email]
      );

      if (rows_user.length === 1) {
        let token = jwt.sign({ id: rows_user[0].id }, "user", {
          expiresIn: "1d",
        });
        let resetLink = `${process.env.domainURL}/resetPassword/${token}`;
        let subject = "Reset Password Link";
        let msg = await ResetPasswordTemplate.MailSent({
          username: rows_user[0].username,
          resetLink,
        });

        let result = await EmailHandler.sendEmail(
          rows_user[0].email,
          msg,
          subject,
          "",
          getLogo()
        );
        return result;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  // super admin forgot password
  async super_forgotPassword(email) {
    try {
      const [rows_user, fields] = await connectPool.query(
        `SELECT email,id,username from users WHERE email = ? AND role = 'Super Admin' LIMIT 1`,
        [email]
      );

      if (rows_user.length === 1) {
        let token = jwt.sign({ id: rows_user[0].id }, "user", {
          expiresIn: "1d",
        });
        let resetLink = `${process.env.domainURL}/resetPassword/${token}`;
        let subject = "Reset Password Link";
        let msg = await ResetPasswordTemplate.MailSent({
          username: rows_user[0].username,
          resetLink,
        });

        let result = await EmailHandler.sendEmail(
          rows_user[0].email,
          msg,
          subject,
          "",
          getLogo()
        );
        return result;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  async resetPassword(id, input) {
    try {
      // console.log(id, input);
      const [rows_user, fields] = await connectPool.query(
        `SELECT id from users WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_user.length === 1) {
        let newpassword = await bcriptjs.hash(input.newpassword, 8);
        const [rows, fields] = await connectPool.query(
          `UPDATE users SET 
                        password = '${newpassword}',
                        updated_at = '${getCurrentTime()}'              
                        WHERE users.id = ? `,
          [rows_user[0].id]
        );
        return rows;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }

  // Reset Password for super admin

  async super_resetPassword(id, input) {
    try {
      // console.log(id, input);
      const [rows_user, fields] = await connectPool.query(
        `SELECT id from users WHERE id = ? AND role = 'Super Admin' LIMIT 1`,
        [id]
      );

      if (rows_user.length === 1) {
        let newpassword = await bcriptjs.hash(input.newpassword, 8);
        const [rows, fields] = await connectPool.query(
          `UPDATE users SET 
                        password = '${newpassword}',
                        updated_at = '${getCurrentTime()}'              
                        WHERE users.id = ? `,
          [rows_user[0].id]
        );
        return rows;
      }
      return rows_user;
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = new Auth();
