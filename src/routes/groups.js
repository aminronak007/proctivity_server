var router = require("express").Router();
const auth = require("../middleware/auth");
const GroupController = require("../controller/GroupsController");
const subscriptionCheck = require("../middleware/subscription_check");

router.post(
  "/groups/status/add",
  auth,
  subscriptionCheck,
  GroupController.addGroupAndStatus
);
router.get(
  "/group/list",
  auth,
  subscriptionCheck,
  GroupController.getGroupAndStatus
);
router.put(
  "/group/status/update",
  auth,
  subscriptionCheck,
  GroupController.updateGroupAndStatus
);
router.delete(
  "/group/delete/:id",
  auth,
  subscriptionCheck,
  GroupController.deleteGroupAndStatus
);

router.get(
  "/group/GetGroupStatusHirarchy",
  auth,
  GroupController.GetGroupStatusHirarchy
);

module.exports = router;
