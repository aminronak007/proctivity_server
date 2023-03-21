const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const stripe_service = require("../service/stripe");

const invoice_model = require("../models/invoice");

class InvoiceController {
    constructor() {}

    async GetInvoices(req, res) {
        try {
            const result = await invoice_model.GetInvoices(req);

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

    async DownloadInvoice(req, res) {
        try {
            const result = await stripe_service.RetriveInvoiceinfo(
                req,
                req.body.invoice_id
            );
            ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, {
                url: result.invoice_pdf,
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
}

module.exports = new InvoiceController();
