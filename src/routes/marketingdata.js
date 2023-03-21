var router = require("express").Router();
const auth = require("../middleware/auth");
const subscriptionCheck = require("../middleware/subscription_check");
const MarketingDataController = require("../controller/MarketingDataController");

router.get(
  "/marketing/data/:flag",
  auth,
  subscriptionCheck,
  MarketingDataController.getMarketingData
);
router.get(
  "/marketing/data/type",
  auth,
  subscriptionCheck,
  MarketingDataController.getMarketingDataByType
);
router.post(
  "/marketing/data/add",
  auth,
  subscriptionCheck,
  MarketingDataController.addMarketingData
);
router.put(
  "/marketing/data/update",
  auth,
  subscriptionCheck,
  MarketingDataController.updateMarketingData
);
router.delete(
  "/marketing/data/delete",
  auth,
  subscriptionCheck,
  MarketingDataController.deleteMarketingData
);

module.exports = router;
