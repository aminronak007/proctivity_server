const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Auth = require("../models/auth");
const UserModel = require("../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { unlinkFiles } = require("../helpers/helpers");

class AuthController {
  constructor() {}

  // User Registration Controller.
  async register(req, res) {
    try {
      req
        .checkBody("username")
        .notEmpty()
        .withMessage("Please enter username.")
        .matches(/^[a-zA-Z][a-zA-Z ]*$/)
        .withMessage("Please enter a valid username.")
        .isLength({ max: 20 })
        .withMessage("Username should not be more than 20 Characters.");

      req
        .checkBody("companyname")
        .notEmpty()
        .withMessage("Company name is Required.")
        .matches(/^[a-zA-Z0-9][a-zA-Z 0-9]*[a-zA-Z0-9]$/)
        .withMessage("Provide valid Company name.");
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The email you have entered is invalid")
        .isLength({ max: 60 })
        .withMessage("Email id should not be more than 60 Characters.");
      req
        .checkBody("phone")
        .notEmpty()
        .withMessage("Please enter mobile number.")
        .matches(/^[0-9]+$/)
        .withMessage("Please enter a valid mobile number.")
        .isLength({ min: 9, max: 10 })
        .withMessage("Please enter a valid mobile number.");
      // req.checkBody("brandcolor", "Please choose a brand color.").notEmpty();
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("Please enter password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length.");
      if (req.body.logo) {
        req.checkBody("logo", "Please add a logo image.").notEmpty();
      }

      req
        .checkBody("address_line1")
        .notEmpty()
        .withMessage("Please enter address")
        .matches(/.*\S.*/)
        .withMessage("Only space not allowed");

      req
        .checkBody("state")
        .notEmpty()
        .withMessage("Please enter state")
        .matches(/.*\S.*/)
        .withMessage("Only space not allowed");

      req
        .checkBody("city")
        .notEmpty()
        .withMessage("Please enter city")
        .matches(/.*\S.*/)
        .withMessage("Only space not allowed");
      req
        .checkBody("postal_code")
        .notEmpty()
        .withMessage("Please enter postal code")
        .matches(/^[0-9]*$/)
        .withMessage("Please enter valid postal code");

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

      if (!req.file) {
        return ResponseHandler.errorResponse(res, 400, MSGConst.LOGO_MSG, []);
      }

      let filename = (await req.file) ? req.file?.filename : null;
      const result = await Auth.register(req.body, filename);

      if (result[0]?.email === req.body.email) {
        if (req.file) {
          unlinkFiles(req.file?.path);
        }
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_EXISTS,
          []
        );
      }

      if (result[0]?.phone == parseInt(req.body.phone)) {
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

      if (!result) {
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
      ResponseHandler.successResponse(
        res,
        200,
        MSGConst.REGISTRATION_SUCCESS,
        []
      );
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User Login Controller.
  async login(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The Email Id you have entered is invalid.");
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("Please enter password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length.");
      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      const result = await Auth.login(req.body);

      if (result[0]?.status === "inactive") {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result[0]?.is_delete === 1) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result.length == 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LOGIN_FAILED,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User Login Controller.
  async login_as(req, res) {
    try {
      const result = await Auth.login_as(req.params.id);

      if (result[0]?.status === "inactive") {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result[0]?.is_delete === 1) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SUB_USER_DEACTIVATED,
          []
        );
      }
      if (result.length == 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.USERNOTFOUND,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Super Admin Login Controller.
  async super_login(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The Email Id you have entered is invalid.");
      req
        .checkBody("password")
        .notEmpty()
        .withMessage("Please enter password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length.");
      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      const result = await Auth.super_login(req.body);

      if (result.length == 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LOGIN_FAILED,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.LOGIN_SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Logout Controller all users.
  async logout(req, res) {
    try {
      const result = await Auth.logout(req.user);
      ResponseHandler.successResponse(res, 200, MSGConst.LOGOUT_SUCCESS, []);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // User details controller to check login user data.
  async check(req, res) {
    if (req.user) {
      var token = req.user.token;
      req.user = await UserModel.getUserFullDetails(req.user.id);
      req.user.token = token;
      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, req.user);
    } else {
      ResponseHandler.errorResponse(res, 400, MSGConst.LOGIN_FAIL, []);
    }
  }

  // Forgot Password Controller for user.
  async forgotPassword(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The email you have entered is invalid.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Auth.forgotPassword(req.body.email);

      if (result?.length === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_NOT_EXISTS,
          errors
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.EMAIL_SENT, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
  // super admin forgot password
  async super_forgotPassword(req, res) {
    try {
      req
        .checkBody("email")
        .notEmpty()
        .withMessage("Please enter email.")
        .isEmail()
        .withMessage("The email you have entered is invalid.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Auth.super_forgotPassword(req.body.email);

      if (result?.length === 0) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.EMAIL_NOT_EXISTS,
          errors
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.EMAIL_SENT, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Reset Password Controller for user
  async resetPassword(req, res) {
    try {
      req
        .checkBody("newpassword")
        .notEmpty()
        .withMessage("Please enter new password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      req
        .checkBody("confirmpassword")
        .notEmpty()
        .withMessage("Please enter confirm password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

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
      try {
        const token = req.params.token;
        const user = await jwt.verify(token, "user");
        const result = await Auth.resetPassword(user.id, req.body);

        if (result.length === 0) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.SOMETHING_WRONG,
            errors
          );
        }
        ResponseHandler.successResponse(res, 200, MSGConst.RESET_PASSWORD, []);
      } catch (errors) {
        console.log(errors);
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LINK_EXPIRES,
          errors
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Reset Password Controller for super admin
  async super_resetPassword(req, res) {
    try {
      req
        .checkBody("newpassword")
        .notEmpty()
        .withMessage("Please enter new password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

      req
        .checkBody("confirmpassword")
        .notEmpty()
        .withMessage("Please enter confirm password.")
        .isLength({ min: 8, max: 16 })
        .withMessage("The password must be 8 to 16 characters in length");

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
      try {
        const token = req.params.token;
        const user = await jwt.verify(token, "user");
        const result = await Auth.super_resetPassword(user.id, req.body);

        if (result.length === 0) {
          return ResponseHandler.errorResponse(
            res,
            400,
            MSGConst.SOMETHING_WRONG,
            errors
          );
        }
        ResponseHandler.successResponse(res, 200, MSGConst.RESET_PASSWORD, []);
      } catch (errors) {
        console.log(errors);
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.LINK_EXPIRES,
          errors
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new AuthController();
