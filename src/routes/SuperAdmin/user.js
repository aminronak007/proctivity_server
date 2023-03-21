var express = require("express");
var router = express.Router();
const auth = require("../../middleware/auth");

var UserController = require("../../controller/SuperAdmin/UserController");

router.post("/user/get_main_users", auth, UserController.GetAllMainUsers);
router.post("/user/request/free-trial", auth, UserController.requestFreeTrial);
module.exports = router;
