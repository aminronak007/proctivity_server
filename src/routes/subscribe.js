var router = require("express").Router();
const auth = require("../middleware/auth");
const SubscribeController = require("../controller/SubsrcibeController");

router.post(
    "/subscribe/create_checkout/:id",
    auth,
    SubscribeController.create_checkout
);
router.get(
    "/subscribe/success_subscription/:id",
    auth,
    SubscribeController.success_subscription
);

router.post(
    "/subscribe/cancel_subscription",
    auth,
    SubscribeController.cancel_subscription
);

router.post(
    "/subscribe/update_autorenew",
    auth,
    SubscribeController.update_auto_renew
);
module.exports = router;
