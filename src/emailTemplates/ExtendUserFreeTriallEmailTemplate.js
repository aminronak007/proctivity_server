class ExtendUserFreeTriallEmailTemplate {
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
      "<br /><p>Your Free trial has successfully extended for the next 14 days." +
      "<br /><p>Enjoy your free trial for 14 days! You can purchase a monthly or yearly subscription when the trial ends. </p>" +
      "<br /><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues.</p>" +
      "<br /><p>Regards,</p><p>Proctivity Team</p><br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new ExtendUserFreeTriallEmailTemplate();
