const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Features = require("../models/features");
const { check, validationResult } = require("express-validator");

class FeaturesController {
  constructor() {}

  // Fetching all features.
  async getFeatures(req, res) {
    try {
      const result = await Features.getFeatures();

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        return ResponseHandler.successResponse(res, 200, "", result);
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Add new Features.
  async addFeature(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter feature name.")
        .isLength({ max: 50 })
        .withMessage("name length less then 50 char")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9 ]*[a-zA-Z0-9]$/)
        .withMessage("Please enter valid name");
      req
        .check("status")
        .isIn(["active", "inactive"])
        .withMessage("Please select valid status");

      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Features.addFeature(req.body);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        if (result[0]?.name === req.body.name) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.FEATURE_EXIST
          );
        }
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.FEATURE_ADD,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Updating feature by its id.
  async updateFeature(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter feature name.")
        .isLength({ max: 50 })
        .withMessage("name length less then 50 char")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9 ]*[a-zA-Z0-9]$/)
        .withMessage("Please enter valide name");
      req
        .check("status")
        .isIn(["active", "inactive"])
        .withMessage("Please select valid status");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Features.updateFeature(req.body);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        if (result[0]?.name === req.body.name) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.FEATURE_EXIST
          );
        }
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.FEATURE_UPDATE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Delete feature by its id.
  async deleteFeature(req, res) {
    try {
      const result = await Features.deleteFeature(req.body.id);

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
          MSGConst.FEATURE_DELETE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new FeaturesController();
