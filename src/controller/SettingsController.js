const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const settings = require("../models/settings");

class SettingsController {
  constructor() {}

  async termsAndCondition(req, res) {
    try {
      req
        .checkBody("text")
        .notEmpty()
        .withMessage("please write Terms And Condition");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await settings.termsAndCondition(req.body);
      console.log(result);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      ResponseHandler.successResponse(
        res,
        200,
        MSGConst.TERMS_CONDITIONS,
        result
      );
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new SettingsController();
