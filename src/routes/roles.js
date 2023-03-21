var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
const RolesController = require("../controller/RolesController");
const subscriptionCheck = require("../middleware/subscription_check");

router.get("/roles/list", auth, subscriptionCheck, RolesController.getRoles);
router.post("/roles/add", auth, subscriptionCheck, RolesController.addRole);
router.put(
  "/roles/update",
  auth,
  subscriptionCheck,
  RolesController.updateRole
);
router.delete(
  "/roles/delete",
  auth,
  subscriptionCheck,
  RolesController.deleteRole
);

module.exports = router;
