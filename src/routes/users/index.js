// const { getHashes } = require("crypto");
var express = require("express");
var router = express.Router();
const usersCtrl = require("../../controller/users/usersCtrl");

router.get("/", usersCtrl.userspage);

//로그인
router.post("/login", usersCtrl.login);

//회원가입
router.post("/register", usersCtrl.signup);

//결제
router.post("/pay", usersCtrl.pay);

module.exports = router;
