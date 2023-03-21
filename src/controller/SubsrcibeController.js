const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Subscribe = require("../models/subscribe");
const { check, validationResult } = require("express-validator");
const stripe_service = require("../service/stripe");
const { subscription_info } = require("../service/stripe");

class SubscribeController {
  constructor() {}

  // Create Checkout using stripe payment methods.
  async create_checkout(req, res) {
    try {
      req
        .checkBody("cardname")
        .notEmpty()
        .withMessage("Please enter card name.");
      req
        .checkBody("cardnumber")
        .notEmpty()
        .withMessage("Please enter card number.")
        .isLength({ min: 16, max: 16 })
        .withMessage("The card number must be 16 numbers in length");
      req
        .checkBody("cvv")
        .notEmpty()
        .withMessage("Please enter cvv.")
        .isLength({ min: 3, max: 3 })
        .withMessage("The CVV must be 3 numbers in length.");
      req
        .checkBody("expirydate")
        .notEmpty()
        .withMessage("Please enter expiry date.");
      req
        .check("autoRenew")
        .isIn([true, false])
        .withMessage("Please provide value for auto renewal");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await stripe_service.CreateCheckout(req.user, req.body);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          400,
          MSGConst.SUBSCRIBE_SUCCESS,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Retrieve subscription details after success.
  async success_subscription(req, res) {
    try {
      const id = req.params.id;
      const result = await stripe_service.success_subscription(id);
      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.SUBSCRIBE_SUCCESS,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Cancel Subscription using stripe subscription delete method
  async cancel_subscription(req, res) {
    try {
      const result = await stripe_service.cancel_subscription(req.body);
      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.SUBSCRIBE_CANCEL,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Update auto renewal of subscription
  async update_auto_renew(req, res) {
    try {
      const { subscription_id, autoRenew } = req.body;
      var result = stripe_service.update_auto_renew(subscription_id, autoRenew);
      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.AUTO_RENEW_CHANGE,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new SubscribeController();
