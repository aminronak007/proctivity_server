class SubUserAccountStatusEmailTemplate {
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
      "<body> Hello " +
      data.username +
      ",<br /><br /> Your account has been " +
      data.account_status +
      ". Please contact Admin for more details. <br /><br />" +
      "<br/><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues. </p> <br/><br/><p>Regards,</p><p>Proctivity Team</p> <div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new SubUserAccountStatusEmailTemplate();
