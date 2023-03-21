const Customer = require("../models/customer");
const CustomerEvent = require("../models/customer_events");
const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const { check, validationResult } = require("express-validator");
const { unlinkFiles } = require("../helpers/helpers");
const stripe = require("../service/stripe");

class CustomerController {
    constructor() {}

    // All Customers list with pagination and searching.
    async getCustomerList(req, res) {
        try {
            const result = await Customer.getCustomerList(req);

            ResponseHandler.successResponse(res, 200, "", result);
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

    // All Status list according to group id.
    async getStatusByGroupId(req, res) {
        try {
            const result = await Customer.getStatusByGroupId(req);

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

    // Add New Customers with all its neccessary details.
    async addCustomerDetails(req, res) {
        try {
            req.checkBody("first_name")
                .notEmpty()
                .withMessage("Please enter first name.");
            req.checkBody("last_name")
                .notEmpty()
                .withMessage("Please enter last name.");
            req.checkBody("email")
                .notEmpty()
                .withMessage("Please enter a email")
                .isEmail()
                .withMessage("Please enter a valid a email");
            req.checkBody("phone")
                .notEmpty()
                .withMessage("Please enter a phone")
                .isLength({ min: 9, max: 10 })
                .withMessage("Please enter a valid phone");
            req.checkBody("address")
                .notEmpty()
                .withMessage("Please enter address");
            req.checkBody("postal_code")
                .notEmpty()
                .withMessage("Please enter postal code");

            const errors = req.validationErrors();
            const deleteFiles = async (data) => {
                let i = 0;
                for (i = 0; i < data.length; i++) {
                    unlinkFiles(data[i]?.path);
                }
            };

            if (errors) {
                if (req.files?.customer_files) {
                    await deleteFiles(req.files.customer_files);
                }
                if (req.files?.customer_images) {
                    await deleteFiles(req.files.customer_images);
                }

                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            let filenames = [];
            const customerDocs = async (data) => {
                for (let i = 0; i < data.length; i++) {
                    await filenames.push({
                        filename: data[i].path.split("uploads/").join(""),
                        original_name: data[i].originalname,
                    });
                }
            };

            if (req.files?.customer_files) {
                await customerDocs(req.files?.customer_files);
            }
            if (req.files?.customer_images) {
                await customerDocs(req.files?.customer_images);
            }

            const result = await Customer.addCustomerDetails(req, filenames);

            if (!result) {
                if (req.files?.customer_files) {
                    await deleteFiles(req.files.customer_files);
                }
                if (req.files?.customer_images) {
                    await deleteFiles(req.files.customer_images);
                }
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            if (result[0]?.email === req.body.email) {
                if (req.files?.customer_files) {
                    await deleteFiles(req.files.customer_files);
                }
                if (req.files?.customer_images) {
                    await deleteFiles(req.files.customer_images);
                }
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.EMAIL_EXISTS,
                    []
                );
            }

            let stripe_payload = { ...req.body };
            stripe_payload.customer_id = result.insertId;
            stripe_payload.table_name = req.user.table_prefix;
            stripe_payload.stripe_key = req.user.stripe_secret_key;
            await stripe.CreateStripeCustomer(stripe_payload);

            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.ADD_CUSTOMER_ENTRY_SUCCESS,
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

    // Update Customer group, group's status and assigned user details.
    async updateCustomerGroupStatus(req, res) {
        try {
            req.checkBody("group_id").notEmpty("Please select a group");
            req.checkBody("status_id").notEmpty("Please select a status");
            req.checkBody("assign_user_id").notEmpty(
                "Please select assign user"
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

            const result = await Customer.updateCustomerGroupStatus(req);

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
                MSGConst.ADD_CUSTOMER_ENTRY_SUCCESS,
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

    // Update Customer details.
    async updateCustomerDetails(req, res) {
        try {
            req.checkBody("first_name")
                .notEmpty()
                .withMessage("Please enter first name.");
            req.checkBody("last_name")
                .notEmpty()
                .withMessage("Please enter last name.");
            req.checkBody("email")
                .notEmpty()
                .withMessage("Please enter a email")
                .isEmail()
                .withMessage("Please enter a valid a email");
            req.checkBody("phone")
                .notEmpty()
                .withMessage("Please enter a phone")
                .isLength({ min: 9, max: 10 })
                .withMessage("Please enter a valid phone");
            req.checkBody("address")
                .notEmpty()
                .withMessage("Please enter address");
            req.checkBody("postal_code")
                .notEmpty()
                .withMessage("Please enter postal code");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Customer.updateCustomerDetails(req);

            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            if (result[0]?.email === req.body.email) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.EMAIL_EXISTS,
                    []
                );
            }

            if (result[0]?.phone === req.body.phone) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.PHONE_EXISTS,
                    []
                );
            }

            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.UPDATE_CUSTOMER_ENTRY_SUCCESS,
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

    // Delete customer entry and its all details from database.
    async deleteCustomerEntry(req, res) {
        try {
            const result = await Customer.deleteCustomerEntry(req);
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
                MSGConst.DELETE_CUSTOMER_ENTRY_SUCESS,
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

    // Fetching all Customer Details
    async ViewCustomerEntry(req, res) {
        try {
            const result = await Customer.view_customer_detail(req);

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

    // Fetching all customer notes according to customer id.
    async getNotesByCustomerById(req, res) {
        try {
            const result = await Customer.getNotesByCustomerId(req);

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

    // Fetching all customer documents according to customer id.
    async getDocsByCustomerById(req, res) {
        try {
            const result = await Customer.getDocsByCustomerById(req);

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

    // Add New notes each customer.
    async addNotesByUser(req, res) {
        try {
            req.checkBody("username")
                .notEmpty()
                .withMessage("Please enter username");
            req.checkBody("notes").notEmpty().withMessage("Please enter notes");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Customer.addNotesByUser(req);

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
                MSGConst.ADD_NOTES_SUCCESS,
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

    // Fetch single notes details by its id.
    async readNoteById(req, res) {
        try {
            const result = await Customer.readNoteById(req);

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
                MSGConst.SUCCESS,
                result[0]
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

    // Update each single note by its id.
    async updateNotesById(req, res) {
        try {
            req.checkBody("notes").notEmpty().withMessage("Please enter notes");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Customer.updateNotesById(req);

            if (!result) {
                if (req.files?.customer_files) {
                    await deleteFiles(req.files.customer_files);
                }
                if (req.files?.customer_images) {
                    await deleteFiles(req.files.customer_images);
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
                MSGConst.UPDATE_NOTES_SUCCESS,
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

    // Delete each single note by its id.
    async deleteNotesById(req, res) {
        try {
            const result = await Customer.deleteNotesById(req);

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
                MSGConst.DELETE_NOTES_SUCCESS,
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

    // Add new documents for each customer.
    async addDocsByUser(req, res) {
        try {
            if (!req.files.customer_docs) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.FILE_TYPE_ERROR,
                    []
                );
            }
            if (!req.files) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.ERROR_CUSTOMER_DOCS,
                    []
                );
            }

            let filenames = [];
            if (req.files) {
                for (let i = 0; i < req.files.customer_docs?.length; i++) {
                    await filenames.push({
                        filename: req.files?.customer_docs[i].filename,
                        original_name: req.files?.customer_docs[i].originalname,
                    });
                }
            }

            const result = await Customer.addDocsByUser(req, filenames);

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
                MSGConst.ADD_CUSTOMER_DOCS,
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

    // Fetch single Documents details by its id.
    async readDocById(req, res) {
        try {
            const result = await Customer.readDocById(req);

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
                MSGConst.ADD_CUSTOMER_DOCS,
                result[0]
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

    // Update each document by its id.
    async updateDocsById(req, res) {
        try {
            if (!req.file) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.ERROR_CUSTOMER_DOCS,
                    []
                );
            }

            const result = await Customer.updateDocsByById(
                req,
                req.file.filename
            );

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
                MSGConst.ADD_CUSTOMER_DOCS,
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

    // Delete each document by its id.
    async deleteDocById(req, res) {
        try {
            const result = await Customer.deleteDocById(req);

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
                MSGConst.DELETE_CUSTOMER_DOCS,
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

    // Add customer events to each customer.
    async AddCustomerEvent(req, res) {
        try {
            req.checkBody("title").notEmpty().withMessage("Please enter title");
            req.checkBody("start")
                .notEmpty()
                .withMessage("Please select start date and time.");
            req.checkBody("end")
                .notEmpty()
                .withMessage("Please select end date and time.");
            req.checkBody("desc")
                .notEmpty()
                .withMessage("Please enter desciption.");
            req.checkBody("event_color")
                .notEmpty()
                .withMessage("Please select color.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await CustomerEvent.add_customer_event(req);
            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            if (result[0]?.customer_id === parseInt(req.body.customer_id)) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.CUSTOMER_EVENT_EXISTS,
                    []
                );
            }

            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.CUSTOMER_ADD_EVENT,
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

    // Update each customer events by its id.
    async UpdateCustomerEvent(req, res) {
        try {
            req.checkBody("title").notEmpty().withMessage("Please enter title");
            req.checkBody("start")
                .notEmpty()
                .withMessage("Please select start date and time.");
            req.checkBody("end")
                .notEmpty()
                .withMessage("Please select end date and time.");
            req.checkBody("desc")
                .notEmpty()
                .withMessage("Please enter desciption.");
            req.checkBody("event_color")
                .notEmpty()
                .withMessage("Please select color.");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await CustomerEvent.update_customer_event(req);
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
                MSGConst.CUSTOMER_UPDATE_EVENT,
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

    // Fetch all customer event details.
    async GetCustomerEvent(req, res) {
        try {
            const result = await CustomerEvent.get_customer_event(req);
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

    // Delete each customer event by its id.
    async DeleteCustomerEvent(req, res) {
        try {
            const result = await CustomerEvent.delete_customer_event(req);
            ResponseHandler.successResponse(
                res,
                200,
                MSGConst.CUSTOMER_DELETE_EVENT,
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

    // Assigning group and status to customer.
    async assignStatus(req, res) {
        try {
            req.checkBody("group_id")
                .notEmpty()
                .withMessage("Please select group");
            req.checkBody("status_id")
                .notEmpty()
                .withMessage("Please select status.");
            req.checkBody("id")
                .notEmpty()
                .withMessage("Please provide valid details");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Customer.assignStatus(req);

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
                MSGConst.UPDATE_CUSTOMER_ENTRY_SUCCESS,
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

    // Assigning user to customer.
    async assignUser(req, res) {
        try {
            req.checkBody("assign_user_id")
                .notEmpty()
                .withMessage("Please select user");
            req.checkBody("id")
                .notEmpty()
                .withMessage("Please provide valid details");

            const errors = req.validationErrors();

            if (errors) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    errors
                );
            }

            const result = await Customer.assignUser(req);

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
                MSGConst.UPDATE_CUSTOMER_ENTRY_SUCCESS,
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

    // Fetching all User list.
    async userList(req, res) {
        try {
            const result = await Customer.userList(req);

            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }

            ResponseHandler.successResponse(res, 200, "", result);
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

module.exports = new CustomerController();
