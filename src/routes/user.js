var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
const subscriptionCheck = require("../middleware/subscription_check");
const { upload } = require("../middleware/multer");

var UserController = require("../controller/UserController");

router.get("/user/profile", auth, UserController.profile);
router.put(
    "/user/edit-profile/:id",
    upload.single("logo"),
    auth,
    UserController.editProfile
);
router.put(
    "/user/change-password/:id",
    auth,
    subscriptionCheck,
    UserController.changePassword
);
router.post(
    "/user/update_stripe_details",
    auth,
    UserController.UpdateStripeDetails
);

router.put("/user/edit-card/:id", auth, UserController.updateCardDetails);
router.get("/user/details/:id", auth, UserController.getUserDetails);
router.get(
    "/user/package/details/:id",
    auth,
    UserController.getUserPackageDetails
);
router.put(
    "/user/update/address/:id",
    auth,
    subscriptionCheck,
    UserController.updateUserAddress
);

router.post(
    "/user/sub_user/create/:id",
    auth,
    subscriptionCheck,
    UserController.AddSubUser
);
router.put(
    "/user/sub_user/update/:id",
    auth,
    subscriptionCheck,
    UserController.EditSubUser
);
router.delete(
    "/user/sub_user/delete/:id",
    auth,
    subscriptionCheck,
    UserController.DeleteSubUser
);
router.get(
    "/user/sub_user/view/:id",
    auth,
    subscriptionCheck,
    UserController.ViewSubUser
);
router.post(
    "/user/sub_user/get_all/:id",
    auth,
    subscriptionCheck,
    UserController.GetAllSubUsers
);
router.post(
    "/user/sub_user/send_access_key",
    auth,
    subscriptionCheck,
    UserController.sendAccessKey
);
router.post(
    "/user/permissions/create_or_update_permissions",
    auth,
    subscriptionCheck,
    UserController.CreateOrUpdateUserPermissions
);

router.post(
    "/user/permissions/GetUserPermissions",
    auth,
    subscriptionCheck,
    UserController.GetUserPermissions
);

router.post(
    "/user/permissions/GetUserGroupPermissions",
    auth,
    subscriptionCheck,
    UserController.GetUserGroupPermissions
);

router.put(
    "/user/sub_user/update-status",
    auth,
    subscriptionCheck,
    UserController.updateUserStatus
);
router.get(
    "/user/register_proctivity_as_connected_account",
    auth,
    UserController.RegisterProctivityAsConnectedAccount
);
module.exports = router;
