class SendAccessKeyEmailTemplate {
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
      "<body>Hello " +
      data.username +
      ",<br /><br /> You are successfully onboarded to the Portal. Here are your login credentials: <br /><br /> Email ID: " +
      data.email +
      "<br /> Password : " +
      data.password +
      "<br /><br /> You can click on the following link :<a href= " +
      data.resetLink +
      " >click here</a>  and use the credentials provided to login onto the portal.<br/><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues. </p> <br/><br/><p>Regards,</p><p>Proctivity Team</p><br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new SendAccessKeyEmailTemplate();
