var express = require("express");
var router = express.Router();
const usersCtrl = require("../../controller/users/usersCtrl");

//로그인
router.post("/login", usersCtrl.login);

//생체정보 등록여부
router.put("/bio-regist", usersCtrl.bioRegist);

//회원가입
router.post("/register", usersCtrl.signup);

//아이디 찾기
router.get("/find-id", usersCtrl.findId);

//비밀번호 수정
router.put("/change-pwd", usersCtrl.changePwd);

//회원삭제
router.delete("/delete", usersCtrl.deleteUser);

//결제 관련 test -- 빌링키 받아오기 수정필요
router.post("/card-regist", usersCtrl.cardRegist);

//결제
router.post("/pay", usersCtrl.pay);

//결제 내역 확인
router.get("/pay-list", usersCtrl.paylist);

//정맥 등록
router.post("/vein-regist", (req, res) => {});

module.exports = router;
