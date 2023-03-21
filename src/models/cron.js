const UserModel = require("../models/user");
const EmailHandler = require("../handlers/emailhandler");
const SubcriptionExpireReminderTemplate = require("../emailTemplates/SubcriptionExpireReminderTemplate");
const FreeTrialExpireEmailTemplate = require("../emailTemplates/FreeTrialExpireEmailTemplate");
const { check, validationResult } = require("express-validator");
const { getLogo } = require("../helpers/helpers");
const moment = require("moment-timezone");
const TIME_ZONE = process.env.TIME_ZONE || "Australia/Sydney";

class Cron {
  constructor() {}

  async sendPackageExpiryReminder() {
    const [users, fields] = await connectPool.query(
      `SELECT id,email,username FROM users WHERE role != 'Super Admin' AND parent = 0`
    );

    if (users.length > 0) {
      let data = [];
      let i = 0;
      let user_package_info = "";
      while (i < users.length) {
        user_package_info = await UserModel.packageinfo(users[i].id);

        if (user_package_info.difference_in_days <= 5) {
          await data.push(user_package_info);
        }
        i++;
      }
      let emailSentUsers = [];
      let j = 0;
      let subject =
        user_package_info.package_type === "Trial"
          ? "Free Trial Ends"
          : "Subscription Renewal";

      let expiryDate = moment(user_package_info.package_expiry_date)
        .tz(TIME_ZONE)
        .format("DD-MM-YYYY");
      if (data.length > 0) {
        while (j < data.length) {
          let msg = "";

          if (user_package_info?.package_type === "Trial") {
            msg = await FreeTrialExpireEmailTemplate.MailSent({
              username: users[j].username,
              expiryDate,
            });
          } else {
            msg = await SubcriptionExpireReminderTemplate.MailSent({
              username: users[j].username,
              expiryDate,
            });
          }

          let result = await EmailHandler.sendEmail(
            users[j].email,
            msg,
            subject,
            "",
            getLogo()
          );
          emailSentUsers.push(users[j].email);
          j++;
        }
        return emailSentUsers;
      }
      return data;
    }
  }
}
module.exports = new Cron();
