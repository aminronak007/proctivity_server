const router = require("express").Router();
const Cron = require("../controller/CronController");

router.get(
    "/cron/send_package_expiry_reminder",
    Cron.sendPackageExpireReminder
);

module.exports = router;
