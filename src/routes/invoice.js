var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
var InvoiceController = require("../controller/InvoiceController");
const subscriptionCheck = require("../middleware/subscription_check");

router.post(
  "/invoice/:id/all",
  auth,
  subscriptionCheck,
  InvoiceController.GetInvoices
);
router.post(
  "/invoice/downloadinvoice",
  auth,
  subscriptionCheck,
  InvoiceController.DownloadInvoice
);

module.exports = router;
