var express = require("express");
const adminCtrl = require("../../controller/admin/adminCtrl");
var router = express.Router();

/* GET users listing. */
router.get("/", adminCtrl.adminControl);

module.exports = router;
