var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
const subscriptionCheck = require("../middleware/subscription_check");

const { upload } = require("../middleware/multer");

var AuthController = require("../controller/AuthController");
// var AdminController = require("../controller/AdminController");

router.post("/auth/register", upload.single("logo"), AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/login_as/:id", AuthController.login_as);
router.get("/auth/logout", auth, AuthController.logout);
router.get("/auth/check", auth, AuthController.check);
router.post("/auth/forgot-password", AuthController.forgotPassword);
router.put("/auth/reset-password/:token", AuthController.resetPassword);
router.post("/auth/super_login", AuthController.super_login);
router.post("/auth/admin/forgot-password", AuthController.super_forgotPassword);

router.put(
  "/auth/admin/reset-password/:token",
  AuthController.super_resetPassword
);

module.exports = router;
