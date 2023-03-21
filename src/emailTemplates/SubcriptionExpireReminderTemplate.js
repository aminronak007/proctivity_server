class SubcriptionExpireReminderTemplate {
  MailSent(data) {
    return (
      "<!DOCTYPE html>" +
      '<html lang="en">' +
      "" +
      "<head>" +
      '    <meta charset="UTF-8">' +
      "    <title>Document</title>" +
      "<style>p{margin:0px;}</style></head>" +
      "" +
      "<body><p>Hello " +
      data?.username +
      ",</p>" +
      "<p>Your subscription ends on " +
      data.expiryDate +
      ". We will automatically charge the payment method on file if auto renewal is turned on. To discontinue using your subscription and avoid being charged, cancel before" +
      data.expiryDate +
      "</p>" +
      "<br /><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues.</p>" +
      "<p>Regards,</p>" +
      "<p>Proctivity Team</p>br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new SubcriptionExpireReminderTemplate();
