var router = require("express").Router();
const auth = require("../middleware/auth");
const MarketingDataListController = require("../controller/MarketingDataListController");
const subscriptionCheck = require("../middleware/subscription_check");

router.post(
  "/marketing-data-list",
  auth,
  subscriptionCheck,
  MarketingDataListController.getMarketingData
);
router.put(
  "/marketing-data-list/update",
  auth,
  subscriptionCheck,
  MarketingDataListController.updateMarketingData
);
// router.delete(
//     "/marketing-data-list/delete",
//     auth,
//     MarketingDataListController.deleteMarketingData
// );

module.exports = router;
