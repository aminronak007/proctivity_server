const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const Group = require("../models/groups");
const { check, validationResult } = require("express-validator");

class GroupController {
  constructor() {}

  // Add Group and multiple statuses.
  async addGroupAndStatus(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter a group name.");

      req
        .checkBody("status")
        .notEmpty()
        .withMessage("Please enter atleast one status to the group.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }

      const result = await Group.addGroupAndStatus(req);
      if (result[0]?.name.toLowerCase() === req.body.name.toLowerCase()) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.GROUP_EXISTS,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.GROUP_ADDED, []);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Fetching all groups and its status.
  async getGroupAndStatus(req, res) {
    try {
      const result = await Group.GetGroupStatusHirarchy(req);

      ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Update group and its status by its id.
  async updateGroupAndStatus(req, res) {
    try {
      req
        .checkBody("name")
        .notEmpty()
        .withMessage("Please enter a group name.");

      req
        .checkBody("status")
        .notEmpty()
        .withMessage("Please enter atleast one status to the group.");

      const errors = req.validationErrors();

      if (errors) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.SOMETHING_WRONG,
          errors
        );
      }
      const result = await Group.updateGroupAndStatus(req);

      if (result[0]?.name.toLowerCase() === req.body.name.toLowerCase()) {
        return ResponseHandler.errorResponse(
          res,
          400,
          MSGConst.GROUP_EXISTS,
          []
        );
      }
      ResponseHandler.successResponse(res, 200, MSGConst.GROUP_UPDATED, []);
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Delete group, its status and also customer data related to the particular group.
  async deleteGroupAndStatus(req, res) {
    try {
      const result = await Group.deleteGroupAndStatus(req);

      if (!result) {
        ResponseHandler.errorResponse(
          res,
          200,
          MSGConst.SOMETHING_WRONG,
          result
        );
      }
      ResponseHandler.successResponse(
        res,
        200,
        MSGConst.GROUP_STATUS_DELETED,
        []
      );
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }

  // Fetching all groups and its multiple status according to its hirarchy.
  async GetGroupStatusHirarchy(req, res) {
    try {
      const result = await Group.GetGroupStatusHirarchy(req);

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
          MSGConst.SUCCESS,
          result
        );
      }
    } catch (e) {
      console.log(e);
      ResponseHandler.errorResponse(res, 400, MSGConst.SOMETHING_WRONG, []);
    }
  }
}

module.exports = new GroupController();
