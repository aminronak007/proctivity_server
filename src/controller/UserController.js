const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const User = require("../models/user");
const Group = require("../models/groups");
const StripeService = require("../service/stripe");
const { check, validationResult } = require("express-validator");
const { unlinkFiles, getSettings } = require("../helpers/helpers");
class UserController {
    constructor() {}

    // Fetching all User details
    async profile(req, res) {
        try {
            const result = req.user;
            if (result.length == 0) {
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

    // Update user profile by user id.
    async editProfile(req, res) {
        try {
            req.checkBody("username")
                .notEmpty()
                .withMessage("Please enter username.")
                .matches(/^[a-zA-Z][a-zA-Z ]*$/)
                .withMessage("Please enter a valid username.")
                .isLength({ max: 20 })
                .withMessage("(Max length of 20 characters");

            req.checkBody("companyname")
                .notEmpty()
                .withMessage("Company name is Required.")
                .matches(/^[a-zA-Z][a-zA-Z 0-9]*$/)
                .withMessage("Provide valid Company name.");

            req.checkBody("phone")
                .notEmpty()
                .withMessage("Please enter mobile number.")
                .matches(/^[0-9]+$/)
                .withMessage("Please enter a valid mobile number.")
                .isLength({ min: 9, max: 10 })
                .withMessage("Please enter a valid mobile number.");
            req.checkBody(
                "brandcolor",
                "Please choose a brand color."
            ).notEmpty();

            req.checkBody("address_line1")
                .notEmpty()
                .withMessage("Please enter address line 1.");

            req.checkBody("postal_code")
                .notEmpty()
                .withMessage("Please enter postal code.")
                .matches(/^[0-9]+$/)
                .withMessage("Please enter a valid postal code.");

            req.checkBody("city").notEmpty().withMessage("Please enter city.");
            req.checkBody("state")
                .notEmpty()
                .withMessage("Please enter state.");

            const errors = req.validationErrors();

            if (errors) {
                if (req.file) {
                    unlinkFiles(req.file?.path);
                }
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            if (!req.body.logo[1] && req.file) {
                if (req.file === undefined) {
                    return ResponseHandler.errorResponse(
                        res,
                        400,
                        MSGConst.LOGO_MSG,
                        errors
                    );
                }
            }

            let filename = (await req.file)
                ? req.file?.filename
                : req.body.logo[1];

            const result = await User.editProfile(
                req.params.id,
                req.body,
                filename
            );

            if (result[0]?.phone === parseInt(req.body.phone)) {
                if (req.file) {
                    unlinkFiles(req.file?.path);
                }
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.PHONE_EXISTS,
                    []
                );
            }

            if (!result || result.length === 0) {
                if (req.file) {
                    unlinkFiles(req.file?.path);
                }
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }
            ResponseHandler.successResponse(res, 200, MSGConst.EDIT_PROFILE, {
                filename: `${process.env.UPLOAD_DIR}/${filename}`,
                logo: filename,
            });
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

    async UpdateStripeDetails(req, res) {
        try {
            req.checkBody("stripe_public_key")
                .notEmpty()
                .withMessage("Please enter public Key.");

            req.checkBody("stripe_secret_key")
                .notEmpty()
                .withMessage("Please enter secret Key.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const webhook = await StripeService.RegisterAndUpdateWebhooks(
                req.user,
                req.body
            );

            if (!webhook) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            const result = await User.UpdateStripeDetails(
                req.user.id,
                req.body
            );

            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.STRIPE_DETAIL_UPDATE_SUCCESS,
                []
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

    // Update user password by user id.
    async changePassword(req, res) {
        try {
            req.checkBody("currentpassword")
                .notEmpty()
                .withMessage("Please enter current password.")
                .isLength({ min: 8, max: 16 })
                .withMessage(
                    "The password must be 8 to 16 characters in length."
                );
            req.checkBody("newpassword")
                .notEmpty()
                .withMessage("Please enter new password.")
                .isLength({ min: 8, max: 16 })
                .withMessage(
                    "The password must be 8 to 16 characters in length."
                );
            req.checkBody("confirmpassword")
                .notEmpty()
                .withMessage("Please enter confirm password.")
                .isLength({ min: 8, max: 16 })
                .withMessage(
                    "The password must be 8 to 16 characters in length."
                );

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            if (req.body.newpassword !== req.body.confirmpassword) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.PASSWORD_MATCH,
                    errors
                );
            }
            const result = await User.changePassword(req.params.id, req.body);

            if (result.checkPassword === false) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.OLD_PASSWORD,
                    []
                );
            }
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
                MSGConst.CHANGE_PASSWORD,
                []
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

    // Add new Subuser.
    async AddSubUser(req, res) {
        try {
            req.checkBody("username")
                .notEmpty()
                .withMessage("Please enter username.");

            req.checkBody("email")
                .notEmpty()
                .withMessage("Please enter email.")
                .isEmail()
                .withMessage("The email you have entered is invalid")
                .isLength({ max: 60 })
                .withMessage("Email id should not be more than 60 Characters.");

            req.checkBody("phone")
                .notEmpty()
                .withMessage("Please enter mobile number.")
                .matches(/^[0-9]+$/)
                .withMessage("Please enter a valid mobile number.")
                .isLength({ min: 9, max: 10 })
                .withMessage("Please enter a valid mobile number.");

            req.checkBody("role").notEmpty().withMessage("Please enter role.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await User.register_sub_user(
                req.body,
                req.params.id
            );

            if (result[0]?.email === req.body.email) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.EMAIL_EXISTS,
                    []
                );
            }

            if (parseInt(result[0]?.phone) === parseInt(req.body.phone)) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.PHONE_EXISTS,
                    []
                );
            }

            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            const payment_intent = await StripeService.GetSubUserPayment(
                req.user,
                req.body,
                result.insertId
            );

            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.USER_ADDED,
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

    // Update user Card Details.
    async updateCardDetails(req, res) {
        try {
            console.log(req.body);
            req.checkBody("cardname")
                .notEmpty()
                .withMessage("Please enter card name.");
            req.checkBody("cardnumber")
                .notEmpty()
                .withMessage("Please enter card number.")
                .isLength({ min: 16, max: 16 })
                .withMessage("The card number must be 16 numbers in length");
            req.checkBody("cvv")
                .notEmpty()
                .withMessage("Please enter cvv.")
                .isLength({ min: 3, max: 3 })
                .withMessage("The CVV must be 3 numbers in length.");
            req.checkBody("expirydate")
                .notEmpty()
                .withMessage("Please enter expiry date.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            await StripeService.updateStripeCardDetail(req.user, req.body);
            const result = await User.updateCardDetails(
                req.params.id,
                req.body
            );
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
                    MSGConst.UPDATE_CARD_SUCCESS,
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

    // Fetching all the user details.
    async getUserDetails(req, res) {
        try {
            const result = await User.getUserFullDetails(req.params.id);
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

    // Fetching all user packages.
    async getUserPackageDetails(req, res) {
        try {
            const result = await User.getUserPackageDetails(req.params.id);
            if (result.length === 0) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.NO_PACKAGE_FOUND,
                    []
                );
            }

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

    // Update User address details.
    async updateUserAddress(req, res) {
        try {
            req.checkBody("address_line1")
                .notEmpty()
                .withMessage("Please enter address line 1.");

            req.checkBody("postal_code")
                .notEmpty()
                .withMessage("Please enter postal code.")
                .matches(/^[0-9]+$/)
                .withMessage("Please enter a valid postal code.");

            req.checkBody("city").notEmpty().withMessage("Please enter city.");
            req.checkBody("state")
                .notEmpty()
                .withMessage("Please enter state.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await User.editUserAddress(req.params.id, req.body);

            if (!result || result.length === 0) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }
            ResponseHandler.successResponse(res, 200, MSGConst.ADD_ADDRESS, {});
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

    // Update Subuser details.
    async EditSubUser(req, res) {
        try {
            req.checkBody("username")
                .notEmpty()
                .withMessage("Please enter username.");

            req.checkBody("email")
                .notEmpty()
                .withMessage("Please enter email.")
                .isEmail()
                .withMessage("The email you have entered is invalid")
                .isLength({ max: 60 })
                .withMessage("Email id should not be more than 60 Characters.");

            req.checkBody("phone")
                .notEmpty()
                .withMessage("Please enter mobile number.")
                .matches(/^[0-9]+$/)
                .withMessage("Please enter a valid mobile number.")
                .isLength({ min: 9, max: 10 })
                .withMessage("Please enter a valid mobile number.");

            req.checkBody("role").notEmpty().withMessage("Please enter role.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await User.update_sub_user(req.body, req.params.id);

            if (result[0]?.email === req.body.email) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.EMAIL_EXISTS,
                    []
                );
            }

            if (result[0]?.phone === parseInt(req.body.phone)) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.PHONE_EXISTS,
                    []
                );
            }

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
                MSGConst.USER_UPDATED,
                []
            );
        } catch (e) {
            console.log(e.message);
            ResponseHandler.errorResponse(res, 400, e.message, []);
        }
    }

    // Delete Subuser by its id.
    async DeleteSubUser(req, res) {
        try {
            const result = await User.delete_sub_user(req.params.id);
            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            await StripeService.RemoveSubscriptionItem(req.params.id);
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.USER_DELETED,
                []
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

    // Fetching all Subuser details.
    async ViewSubUser(req, res) {
        try {
            const result = await User.getUserFullDetails(req.params.id);
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

    // Fetching all Subuser list.
    async GetAllSubUsers(req, res) {
        try {
            const result = await User.GetAllSubUsers(req.params.id, req.body);
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

    // Adding or Updating user permissions.
    async CreateOrUpdateUserPermissions(req, res) {
        try {
            const result = await User.add_or_update_user_permission(req.body);

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

    // Fetching all User permissions.
    async GetUserPermissions(req, res) {
        try {
            const result = await User.GetUserPermissions(req.body);
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

    // Fetching all User group permission.
    async GetUserGroupPermissions(req, res) {
        try {
            const group_result = await Group.GetGroupStatusHirarchy(req);
            const result_final = await User.GetUserGroupPermissions(
                group_result,
                req.body
            );
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.SUCCESS,
                result_final
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

    // Sending Access key (i.e.: Email and password) to subusers.
    async sendAccessKey(req, res) {
        try {
            req.checkBody("id")
                .notEmpty()
                .withMessage("Please provide valid id.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await User.sendAccessKey(req.body.id);

            if (result?.length === 0) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.ACCESSKEY_SEND,
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

    // Update Subuser active/deactive status.
    async updateUserStatus(req, res) {
        try {
            req.checkBody("id").notEmpty().withMessage("Please select group.");
            req.checkBody("status")
                .notEmpty()
                .withMessage("Please select a group status");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await User.updateUserStatus(req);

            if (!result || result.length === 0) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.UPDATE_USER_STATUS,
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
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
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
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async RegisterProctivityAsConnectedAccount(req, res) {
        try {
            const data = await getSettings("terms_condition");
            return res.send([data]);
            await StripeService.RegisterProctivityAsConnectedAccount(req.user);
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

module.exports = new UserController();
