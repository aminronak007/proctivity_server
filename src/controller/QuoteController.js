const ResponseHandler = require("../handlers/responsehandlers");
const MSGConst = require("../constants/messageconstants");
const stripe_service = require("../service/stripe");
const quote_model = require("../models/quote");
const invoice_model = require("../models/invoice");
const { getLogo } = require("../helpers/helpers");
const AcceptQuotationEmailTemplate = require("../emailTemplates/AcceptQuotationEmailTemplate");
const emailHandler = require("../handlers/emailhandler");
class QuoteController {
    constructor() {}
    async CreateQuote(req, res) {
        try {
            const quote = await stripe_service.CreateQuote(req);

            if (quote.id !== undefined) {
                req.body.quote_id = quote.id;
                req.body.quote_status = quote.status;
                await quote_model.CreateQuote(req);
            } else {
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
                MSGConst.CUSTOMER_QUOTES_ADDED,
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

    async GetQuotes(req, res) {
        try {
            const result = await quote_model.GetQuotes(req);

            ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, result);
        } catch (e) {
            ResponseHandler.errorResponse(
                res,
                400,
                MSGConst.SOMETHING_WRONG,
                []
            );
        }
    }

    async GetQuoteDetail(req, res) {
        try {
            req.body.table_prefix = req.user.table_prefix;
            const result = await quote_model.GetQuoteDetail(req);
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

    async UpdateQuote(req, res) {
        try {
            req.body.stripe_secret_key = req.user.stripe_secret_key;
            const quote_cancel = await stripe_service.CancelQuote(
                req,
                req.body.quote_id
            );
            if (quote_cancel.status === "canceled") {
                const quote = await stripe_service.CreateQuote(req);
                if (quote.id !== undefined) {
                    req.body.quote_id = quote.id;
                    req.body.quote_status = quote.status;
                    await quote_model.UpdateQuote(req);
                } else {
                    return ResponseHandler.errorResponse(
                        res,
                        400,
                        MSGConst.SOMETHING_WRONG,
                        []
                    );
                }
            } else {
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
                MSGConst.CUSTOMER_QUOTES_UPDATED,
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

    async CancelQuote(req, res) {
        try {
            const stripe_key = await quote_model.getStripeDetailsByUserId(
                req.body.user_id
            );
            if (stripe_key) {
                req.body.stripe_secret_key = stripe_key.stripe_secret_key;
                const quote_cancel = await stripe_service.CancelQuote(
                    req,
                    req.body.quote_id
                );
                if (quote_cancel.status === "canceled") {
                    req.body.quote_status = quote_cancel.status;
                    req.body.table_prefix = quote_cancel.metadata.table_prefix;
                    await quote_model.UpdateQuteStatus(req);
                } else {
                    return ResponseHandler.errorResponse(
                        res,
                        400,
                        MSGConst.SOMETHING_WRONG,
                        []
                    );
                }

                ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, []);
            } else {
                console.log(e);
                ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
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

    async FinalizeQuote(req, res) {
        try {
            const quote = await stripe_service.FinalizeQuote(
                req,
                req.body.quote_id
            );
            if (quote.status === "open") {
                req.body.quote_status = quote.status;
                req.body.quote_number = quote.number;
                req.body.table_prefix = quote.metadata.table_prefix;
                await quote_model.UpdateQuteStatus(req);
                const quote_detail = await quote_model.GetQuoteDetail(req);
                await stripe_service.StoreQuote(
                    req.user.stripe_secret_key,
                    req.body.quote_id
                );

                let subject = "Review Quotation: " + quote_detail.quote_number;
                const msg = await AcceptQuotationEmailTemplate.MailSent({
                    username: quote_detail.fullName,
                    quote_number: quote_detail.quote_number,
                    quote_id: quote_detail.quote_id,
                    user_id:
                        req.user.parent === 0 ? req.user.id : req.user.parent,
                });

                const result = await emailHandler.sendEmail(
                    quote_detail.email,
                    msg,
                    subject,
                    "",
                    [
                        {
                            filename: quote_detail.quote_number + ".pdf",
                            path: `uploads/quotes/${req.body.quote_id}.pdf`,
                            contentType: "application/pdf",
                        },
                        ...getLogo(),
                    ]
                );
            } else {
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
                MSGConst.CUSTOMER_QUOTES_FINALIZED,
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

    async AcceptQuote(req, res) {
        try {
            const stripe_key = await quote_model.getStripeDetailsByUserId(
                req.body.user_id
            );
            if (stripe_key) {
                req.user = {};
                req.body.stripe_secret_key = stripe_key.stripe_secret_key;
                const quote = await stripe_service.AcceptQuote(
                    req,
                    req.body.quote_id
                );
                if (quote.status === "accepted") {
                    req.body.quote_status = quote.status;
                    req.body.table_prefix = quote.metadata.table_prefix;
                    await quote_model.UpdateQuteStatus(req);
                    const invoice_id = quote.invoice;
                    req.body.stripe_invoice_id = invoice_id;
                    if (invoice_id !== null && invoice_id !== undefined) {
                        const invoice = await stripe_service.FinalizeInvoice(
                            stripe_key.stripe_secret_key,
                            invoice_id
                        );
                        const invoice_number = invoice.number;
                        const invoice_status = invoice.status;
                        req.body.invoice_number = invoice_number;
                        req.body.invoice_status = invoice_status;
                        await invoice_model.CreateInvoice(req);
                    }
                } else {
                    return ResponseHandler.errorResponse(
                        res,
                        400,
                        MSGConst.SOMETHING_WRONG,
                        []
                    );
                }

                ResponseHandler.successResponse(res, 200, MSGConst.SUCCESS, []);
            } else {
                ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
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

    async deleteQuote(req, res) {
        try {
            const result = await quote_model.DeleteQuote(req);

            if (!result) {
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
                    []
                );
            }
            if (result) {
                const quote_cancel = await stripe_service.CancelQuote(
                    req,
                    result[0].quote_id
                );
                if (quote_cancel.status === "canceled") {
                    req.body.quote_status = quote_cancel.status;
                } else {
                    return ResponseHandler.errorResponse(
                        res,
                        400,
                        MSGConst.SOMETHING_WRONG,
                        []
                    );
                }
                return ResponseHandler.successResponse(
                    res,
                    200,
                    MSGConst.CUSTOMER_QUOTES_DELETE,
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
    async GetQuoteDetailByQuoteID(req, res) {
        try {
            const stripe_key = await quote_model.getStripeDetailsByUserId(
                req.params.user_id
            );
            console.log(stripe_key, "stripe_key");
            if (stripe_key) {
                const quotes = await stripe_service.RetriveQuotefo(
                    stripe_key.stripe_secret_key,
                    req.params.id
                );
                req.body.table_prefix = quotes.metadata.table_prefix;
                const result = await quote_model.getQuoteDetailsFromQuoteId(
                    req
                );
                if (result?.length == 0) {
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
                    result
                );
            } else {
                console.log(e);
                return ResponseHandler.errorResponse(
                    res,
                    400,
                    MSGConst.SOMETHING_WRONG,
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

module.exports = new QuoteController();
