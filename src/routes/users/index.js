var express = require("express");
var router = express.Router();
const usersCtrl = require("../../controller/users/usersCtrl");

//로그인
router.post("/login", usersCtrl.login);

//생체정보 등록여부
router.put("/bio-regist", usersCtrl.bioRegist);

//회원가입
router.post("/register", usersCtrl.signup);

//이메일 보내기
router.post("/auth", usersCtrl.auth);

//이메일 인증 확인
router.post("/auth-check", usersCtrl.auth_check);

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

//결제 카드 변경
router.put("/change-card", usersCtrl.changeCard);

//정맥 등록
router.put("/vein-regist", usersCtrl.registVein);

module.exports = router;
