const ResponseHandler = require("../../handlers/responsehandlers");
const MSGConst = require("../../constants/messageconstants");
const Package = require("../../models/SuperAdmin/package");
class PackagesController {
    constructor() {}

    // Fetching all the packages details.
    async get_package(req, res) {
        try {
            const result = await Package.get_package();
            if (result?.length == 0) {
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

    // Update each package details by its id.
    async editPackage(req, res) {
        try {
            req.checkBody("name")
                .notEmpty()
                .withMessage("Please enter package name.")
                .isLength({ max: 50 })
                .withMessage("name length less then 50 char")
                .matches(/^[a-zA-Z0-9][a-zA-Z0-9 ]*[a-zA-Z0-9]$/)
                .withMessage("Please enter valid name");

            req.checkBody("monthly_price")
                .notEmpty()
                .withMessage("Please enter monthly price")
                .matches(/^[0-9]*[.]{1}[0-9]{2}$/)
                .withMessage("Please enter valid monthly price");

            req.checkBody("monthly_price_per_user")
                .notEmpty()
                .withMessage("Please enter monthly price per user")
                .matches(/^[0-9]*[.]{1}[0-9]{2}$/)
                .withMessage("Please enter valid monthly price per user");

            req.checkBody("yearly_price")
                .notEmpty()
                .withMessage("Please enter monthly price")
                .matches(/^[0-9]*[.]{1}[0-9]{2}$/)
                .withMessage("Please enter valid yearly price");

            const errors = req.validationErrors();
            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Package.editPackage(req.body);
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
                    MSGConst.PACKAGE_EDIT,
                    []
                );
            }
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

module.exports = new PackagesController();
