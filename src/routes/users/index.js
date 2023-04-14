var express = require("express");
var router = express.Router();
const usersCtrl = require("../../controller/users/usersCtrl");
const axios = require("axios");
require("dotenv").config();

//필요없음...
router.get("/", usersCtrl.userspage);

//로그인
router.post("/login", usersCtrl.login);

//생체정보 등록여부
router.post("/bio-regist", usersCtrl.bioRegist);

//회원가입
router.post("/register", usersCtrl.signup);

//비밀번호 수정
router.put("/change-pwd", usersCtrl.changePwd);

//회원삭제
router.delete("/delete", usersCtrl.deleteUser);

//결제 관련 test -- 빌링키 받아오기
router.post("/testest", async (req, res) => {
  try {
    const {
      card_number, // 카드 번호
      expiry, // 카드 유효기간
      birth, // 생년월일
      pwd_2digit, // 카드 비밀번호 앞 두자리
      customer_uid, // 카드(빌링키)와 1:1로 대응하는 값, 아이디를 사용할 예정
    } = req.body; // req의 body에서 카드정보 추출

    // 인증 토큰 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: process.env.IMP_KEY, // REST API 키
        imp_secret: process.env.IMP_SECRET,
      },
    });

    const access_token = getToken.data.response.access_token; // 인증 토큰

    const useToken = await axios({
      url: `https://api.iamport.kr/payments/${process.env.PORTONE_API_KEY}`,
      method: "get", // GET method
      headers: {
        // "Content-Type": "application/json"
        "Content-Type": "application/json",
        // 발행된 액세스 토큰
        Authorization: "Bearer ",
        access_token,
      },
    });
    console.log(useToken);

    // 빌링키 발급 요청
    const issueBilling = await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: "post",
      // 인증 토큰 Authorization header에 추가
      headers: { Authorization: access_token },
      data: {
        card_number, // 카드 번호
        expiry, // 카드 유효기간
        birth, // 생년월일
        pwd_2digit, // 카드 비밀번호 앞 두자리
        pg: "kcp", // 빌링키 발급에 사용할 PG
      },
    });
    const { code, message } = issueBilling.data;
    if (code === 0) {
      // 빌링키 발급 성공
      res.send({
        status: "success",
        message: "Billing has successfully issued",
      });
    } else {
      // 빌링키 발급 실패
      console.log("failed, ", message);
      res.send({ status: "failed", message });
    }
  } catch (e) {
    //console.log(e);
    res.status(400).send(e);
  }
});

//카드등록
router.post("/payregist", usersCtrl.payregistCtrl);

//결제
router.post("/pay");

module.exports = router;
