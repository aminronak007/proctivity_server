const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const expressValidator = require("express-validator");
global.connectPool = require("./db/connection");

const AuthRoutes = require("./routes/auth");
const UserRoutes = require("./routes/user");
const PackageRoutes = require("./routes/SuperAdmin/package");
const SubscribeRoutes = require("./routes/subscribe");
const MigrationRoutes = require("./routes/migrations");
const FeaturesRoutes = require("./routes/features");
const WebhookRoutes = require("./routes/webhook");
const RolesRoutes = require("./routes/roles");
const MarketingDataRoutes = require("./routes/marketingdata");
const MarketingDataListRoutes = require("./routes/marketingdataList");
const GroupRoutes = require("./routes/groups");
const CronRoutes = require("./routes/cron");
const CustomerRoutes = require("./routes/customer");
const QuoteRoutes = require("./routes/quote");
const InvoiceRoutes = require("./routes/invoice");
const SuperAdminSettings = require("./routes/SuperAdmin/settings");
const SuperAdminUserRoutes = require("./routes/SuperAdmin/user");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
app.use(expressValidator());
app.use(cors());
app.use("/uploads", express.static(__dirname.replace("/src", "") + "/uploads"));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(
    express.json({
        // We need the raw body to verify webhook signatures.
        // Let's compute it only when hitting the Stripe webhook endpoint.
        verify: function (req, res, buf) {
            if (req.originalUrl.startsWith("/webhook")) {
                req.rawBody = buf.toString();
            }
        },
    })
);
app.use(MigrationRoutes);
app.use(AuthRoutes);
app.use(UserRoutes);
app.use(PackageRoutes);
app.use(SubscribeRoutes);
app.use(FeaturesRoutes);
app.use(WebhookRoutes);
app.use(RolesRoutes);
app.use(MarketingDataRoutes);
app.use(MarketingDataListRoutes);
app.use(GroupRoutes);
app.use(CronRoutes);
app.use(CustomerRoutes);
app.use(QuoteRoutes);
app.use(InvoiceRoutes);
app.use(SuperAdminSettings);
app.use(SuperAdminUserRoutes);

app.use("/", express.static(__dirname.replace("/src", "") + "/Public"));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname.replace("/src", ""), "Public/index.html"));
});
app.listen(port, () => {
    console.log("server is up on port " + port);
});
