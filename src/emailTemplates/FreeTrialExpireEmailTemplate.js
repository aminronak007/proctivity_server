class FreeTrialExpireEmailTemplate {
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
      "<br /><br /><p>Your free trial ends on " +
      data.expiryDate +
      ". To continue using our platform, please purchase a monthly or yearly subscription. You will lose access to your data after the free trial ends." +
      "<br /><br /><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues.</p>" +
      "<br /><br /><p>Regards,</p>" +
      "<p>Proctivity Team</p><br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new FreeTrialExpireEmailTemplate();
