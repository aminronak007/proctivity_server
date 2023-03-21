const router = require("express").Router();
const SettingsController = require("../../controller/SuperAdmin/SettingsController");

router.post(
    "/super-admin/add/user/trial/:id",
    SettingsController.addUserFreeTrial
);

router.post(
    "/super-admin/send/custom/notifications",
    SettingsController.sendUserCustomNotifications
);

router.get("/super-admin/get/all-users", SettingsController.getAllUsers);

router.get(
    "/super-admin/get/free-trial/requests",
    SettingsController.getFreeTrialRequests
);

router.get(
    "/super-admin/cancel/user/trial/:id",
    SettingsController.cancelFreeTrialRequests
);

router.post(
    "/settings/terms-and-condition",
    SettingsController.termsAndCondition
);

router.get(
    "/settings/get-terms-and-condition",
    SettingsController.getTermsAndCondition
);

router.post("/settings/update-commission", SettingsController.updateCommission);

router.get("/settings/get-commission", SettingsController.getCommission);

module.exports = router;
