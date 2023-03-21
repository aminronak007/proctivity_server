class TestEmailTemplate {
  MailSent(data) {
    let name = data.name;
    let total_matched_products = data.total_matched_products;
    let total_new_products = data.total_new_products;
    let total_updated_products = data.total_updated_products;
    let products_with_no_change = data.products_with_no_change;
    let failed_products = data.failed_products;
    return (
      "<!DOCTYPE html>" +
      '<html lang="en">' +
      "" +
      "<head>" +
      '    <meta charset="UTF-8">' +
      "    <title>Document</title>" +
      "<style>p{margin:0px;}</style></head>" +
      "" +
      "<body> <p>Hello " +
      name +
      ",</p>" +
      "<p>&nbsp;</p>" +
      "<p>&nbsp;</p>" +
      "<p><b>Link execution Report</b><br/>" +
      "<p><b>Total matched products</b> : " +
      total_matched_products +
      "</p>" +
      "<p><b>Total new products</b> : " +
      total_new_products +
      "</p>" +
      "<p><b>Updated Products</b> : " +
      total_updated_products +
      "</p>" +
      "<p><b>Products with no change</b> : " +
      products_with_no_change +
      "</p>" +
      "<p><b>Failed Products</b> : " +
      failed_products +
      "</p>" +
      "<p>&nbsp;</p>" +
      "<p>&nbsp;</p>" +
      "<p>Regards,</p>" +
      "<p>Ligh for less Team</p>" +
      // "<img width='100' height='50' src='cid:signatureimage' />" +

      "</body></html>"
    );
  }
}
module.exports = new TestEmailTemplate();
