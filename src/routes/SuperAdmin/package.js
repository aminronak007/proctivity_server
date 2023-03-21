var express = require("express");
var router = express.Router();
const auth = require("../../middleware/auth");
var PackagesController = require("../../controller/SuperAdmin/PackagesController");

router.get("/packages/get_package", auth, PackagesController.get_package);
router.put("/packages/edit", auth, PackagesController.editPackage);

module.exports = router;
