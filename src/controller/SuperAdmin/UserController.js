const ResponseHandler = require("../../handlers/responsehandlers");
const MSGConst = require("../../constants/messageconstants");
const User = require("../../models/SuperAdmin/user.js");

class UserController {
  constructor() {}

  // Fetcing all Main Users (Admin) details.
  async GetAllMainUsers(req, res) {
    try {
      const result = await User.GetAllMainUsers(req.body);
      if (!result) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  async requestFreeTrial(req, res) {
    try {
      const result = await User.requestFreeTrial(req.body);
      if (result.length === 0) {
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
        MSGConst.REQUEST_SEND_SUCCESS,
        result
      );
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new UserController();
