const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const MarketingData = require("../models/marketingdata");

class MarketingDataController {
  constructor() {}

  // Fetching all Marketing data fields.
  async getMarketingData(req, res) {
    try {
      const result = await MarketingData.getMarketingData(req);

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

  // Fetching all Marketing data fields by its type.
  async getMarketingDataByType(req, res) {
    try {
      const result = await MarketingData.getMarketingDataByType(req);

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

  // Add new Marketing data fields.
  async addMarketingData(req, res) {
    try {
      const result = await MarketingData.addMarketingData(req);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        if (result[0]?.value === req.body.value) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.MARKETING_DATA_EXIST
          );
        }
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.MARKETING_DATA_ADD,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Update each Marketing data fields by its id.
  async updateMarketingData(req, res) {
    try {
      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await MarketingData.updateMarketingData(req);

      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      if (result) {
        if (result[0]?.value === req.body.value) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.MARKETING_DATA_EXIST
          );
        }
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.MARKETING_DATA_UPDATE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Delete each Marketing data fields by its id.
  async deleteMarketingData(req, res) {
    try {
      const result = await MarketingData.deleteMarketingData(req);

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
          MSGConst.MARKETING_DATA_DELETE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new MarketingDataController();
