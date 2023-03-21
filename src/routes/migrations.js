var express = require("express");
var router = express.Router();
const auth = require("../middleware/auth");

var Migrations = require("../migrations/Migrations");

router.get("/migrations/create", Migrations.migrate);

module.exports = router;
