const Cron = require("../models/cron");
const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");

class CronController {
  constructor() {}

  // Cron Job for 5 days prior of package expire and free trial expire.
  async sendPackageExpireReminder(req, res) {
    try {
      const result = await Cron.sendPackageExpiryReminder();

      if (!result) {
        ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      if (result.length === 0) {
        ResponseHandler.successResponse(
          res,
          200,
          MSGConst.CRON_JOB_PRIOR_NOTICE,
          result
        );
      } else {
        ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new CronController();
