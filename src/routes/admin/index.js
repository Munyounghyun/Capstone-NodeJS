var express = require("express");
const adminCtrl = require("./adminCtrl");
var router = express.Router();

/* GET users listing. */
router.get("/", adminCtrl.adminControl);

module.exports = router;
