const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Roles = require("../models/roles");

class RolesController {
  constructor() {}

  // Fetching all roles details.
  async getRoles(req, res) {
    try {
      const result = await Roles.getRoles(req);

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

  // Add new Role.
  async addRole(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter role name.")
        .isLength({ max: 50 })
        .withMessage("name length less then 50 char")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9 ]*[a-zA-Z0-9]$/)
        .withMessage("Please enter valid name");

      const errors = req.validationErrors();
      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Roles.addRole(req);

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
          return ResponseHandler.errorResponse(res, 400, MSGConst.ROLE_EXIST);
        }
        return ResponseHandler.successResponse(res, 200, MSGConst.ROLE_ADD, []);
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Update role by its id.
  async updateRole(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter role name.")
        .isLength({ max: 50 })
        .withMessage("name length less then 50 char")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9 ]*[a-zA-Z0-9]$/)
        .withMessage("Please enter valide name");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Roles.updateRole(req);

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
          return ResponseHandler.errorResponse(res, 400, MSGConst.ROLE_EXIST);
        }
        return ResponseHandler.successResponse(
          res,
          200,
          MSGConst.ROLE_UPDATE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Delete role by its id.
  async deleteRole(req, res) {
    try {
      const result = await Roles.deleteRole(req);

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
          MSGConst.ROLE_DELETE,
          []
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new RolesController();
