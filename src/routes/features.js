var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
const FeaturesController = require("../controller/FeaturesController");

router.get("/features/list", auth, FeaturesController.getFeatures);
router.post("/features/add", auth, FeaturesController.addFeature);
router.put("/features/update", auth, FeaturesController.updateFeature);
router.delete("/features/delete", auth, FeaturesController.deleteFeature);

module.exports = router;
