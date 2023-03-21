var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");
var QuoteController = require("../controller/QuoteController");
const subscriptionCheck = require("../middleware/subscription_check");

router.post(
    "/quote/create",
    auth,
    subscriptionCheck,
    QuoteController.CreateQuote
);
router.post(
    "/quote/:id/all",
    auth,
    subscriptionCheck,
    QuoteController.GetQuotes
);
router.get(
    "/quote/:id/detail",
    auth,
    subscriptionCheck,
    QuoteController.GetQuoteDetail
);
router.get(
    "/quote/:user_id/:id/quote-details",
    QuoteController.GetQuoteDetailByQuoteID
);
router.post(
    "/quote/:id/update",
    auth,
    subscriptionCheck,
    QuoteController.UpdateQuote
);
router.post("/quote/:id/cancel", QuoteController.CancelQuote);
router.post(
    "/quote/:id/finalize",
    auth,
    subscriptionCheck,
    QuoteController.FinalizeQuote
);
router.post("/quote/:id/accept", QuoteController.AcceptQuote);
router.delete(
    "/quote/:id/delete",
    auth,
    subscriptionCheck,
    QuoteController.deleteQuote
);

module.exports = router;
