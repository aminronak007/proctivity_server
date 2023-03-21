class AcceptQuotationEmailTemplate {
    MailSent(data) {
        return (
            "<!DOCTYPE html>" +
            '<html lang="en">' +
            "" +
            "<head>" +
            '    <meta charset="UTF-8">' +
            "    <title>Document</title>" +
            "<style>p{margin:0px;} </style></head>" +
            "" +
            "<body> <p>Hello " +
            data.username +
            ",</p>" +
            "<p>Kindly check and confirm attached quotation with quotation number : " +
            data.quote_number +
            " </p><p>To receive an invoice, you should accept the quotation.</p>" +
            "<p>You can also reject the quotation.</p><br /><p><a href='" +
            process.env.domainURL +
            "/quotes-accept/" +
            data.user_id +
            "/" +
            data.quote_id +
            "' style='font-size: 14px;box-shadow: none !important;border-radius: 5px;font-weight: 400;background: #1b97ff;color: white;text-transform: uppercase;padding: 9px 15px;min-width: 130px;border: 0;height: 45px;'>Accept Or Reject</a> </p><br><p>You can email Proctivity at " +
            process.env.SUPPORT_LINK +
            " in case of any issues.</p>" +
            "<br /><br /><p>Regards,</p>" +
            "<p>Proctivity Team</p><br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
            "</body></html>"
        );
    }
}
module.exports = new AcceptQuotationEmailTemplate();
