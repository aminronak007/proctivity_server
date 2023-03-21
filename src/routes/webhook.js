var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
var WebhookController = require("../controller/WebhookController");

router.post("/webhook", WebhookController.index);
router.post("/webhook/update", WebhookController.update);

module.exports = router;
