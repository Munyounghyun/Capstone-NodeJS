var express = require("express");
var router = express.Router();
const usersCtrl = require("../../controller/users/usersCtrl");
const cardCtrl = require("../../controller/card/cardCtrl");
const net = require("net");
const db = require("../../config/db");

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

//정맥 등록
router.put("/vein-regist", usersCtrl.registVein);

//결제 관련 -- 빌링키 발급
router.post("/card-regist", cardCtrl.cardRegist);

//빌링키 삭제
router.delete("/card-delete", cardCtrl.deleteCard);

//결제 아래코드로 수정해야함
router.post("/pay", cardCtrl.pay);

//정맥 결제 (수정필요)
// const server = net.createServer((socket) => {
//   socket.on("data", (data) => {
//     console.log(data + " 확인");
//   });

//   var post = { name: data.toString() }; //넘겨줄 데이터
//   var query = db.query("결제 쿼리 작성");

//   //결제 된 경우
//   socket.write("보낼내용");
// });

//결제 내역 확인
router.get("/pay-list", cardCtrl.paylist);

//결제 카드 변경
router.put("/change-card", cardCtrl.changeCard);

//등록된 카드 불러오기
router.get("/card-list", cardCtrl.cardList);

module.exports = router;
