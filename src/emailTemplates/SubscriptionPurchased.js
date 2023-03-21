class SubscriptionPurchased {
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
      ", Welcome to Procitvity</p>" +
      "<br /><p>Your subscription is activated. Now, you have all the resources you need to get ahead. You can visit Proctivity portal anytime <a href=" +
      process.env.domainURL +
      ">here</a> to see all your features and how to use them.</p>" +
      "<br /><p>You can email Proctivity at " +
      process.env.SUPPORT_LINK +
      " in case of any issues.</p>" +
      "<br /><p>Regards,</p><p>Proctivity Team</p><br /><div><img src='cid:logo' height='50' width='150' alt='logo'></img></div>" +
      "</body></html>"
    );
  }
}
module.exports = new SubscriptionPurchased();
