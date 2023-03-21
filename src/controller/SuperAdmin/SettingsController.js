const ResponseHandler = require("../../handlers/responsehandlers");
const MSGConst = require("../../constants/messageconstants");
const Settings = require("../../models/SuperAdmin/settings");

class SuperAdminController {
    constructor() {}

    async addUserFreeTrial(req, res) {
        try {
            const result = await Settings.addUserFreeTrial(req.params.id);
            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            if (result.length === 2) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.EXCEEDS_USER_FREE_TRIAL,
                    []
                );
            }
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.ADD_FREE_USER_TRIAL,
                result
            );
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async sendUserCustomNotifications(req, res) {
        try {
            req.checkBody("ids")
                .notEmpty()
                .withMessage("Please select at least one user.");

            const errors = req.validationErrors();
            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Settings.sendUserCustomNotifications(req.body);

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
                MSGConst.PUSH_NOTIFICATION_SUCCESS,
                result
            );
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async getAllUsers(req, res) {
        try {
            const result = await Settings.getAllUsers();
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
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async getFreeTrialRequests(req, res) {
        try {
            const result = await Settings.getFreeTrialRequests();
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
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async termsAndCondition(req, res) {
        try {
            req.checkBody("text")
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

            const result = await Settings.termsAndCondition(req.body);
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
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }
    async getTermsAndCondition(req, res) {
        try {
            const result = await Settings.getTermsAndCondition();

            ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async updateCommission(req, res) {
        try {
            req.checkBody("commision_per_invoice")
                .notEmpty()
                .withMessage("Please add commission value");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Settings.setCommissionPerInvoice(req.body);

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
                MSGConst.COMMISSION_PER_INVOICE,
                result
            );
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async getCommission(req, res) {
        try {
            const result = await Settings.getCommisionPerInvoice();
            ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async cancelFreeTrialRequests(req, res) {
        try {
            const result = await Settings.cancelFreeTrialRequests(req);
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
                MSGConst.REQUEST_CANCEL,
                {}
            );
        } catch (e) {
            console.log(e);
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }
}

module.exports = new SuperAdminController();
