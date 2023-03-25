const { getHashes } = require("crypto");
var express = require("express");
var router = express.Router();

const usersCtrl = require("./usersCtrl");
router.get("/", usersCtrl.userspage);

//로그인
router.post("/login", usersCtrl.login);

//회원가입
router.post("/register", usersCtrl.signup);

module.exports = router;
