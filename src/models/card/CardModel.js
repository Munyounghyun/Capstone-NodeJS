const { default: axios } = require("axios");
const db = require("../../config/db");

class CardModel {
  //빌링키 발급
  static cardRegistmd(
    card_number,
    expiry,
    birth,
    pwd_2digit,
    id,
    card_name,
    certification
  ) {
    return new Promise((resolve, reject) => {
      if (certification === true) {
        try {
          db.query(
            "select card_num from card where id=?",
            [id],
            async (err, data) => {
              if (err) {
                reject(err);
              } else if (data[0]?.card_num === card_number.substr(0, 6)) {
                reject({
                  success: false,
                  message: "이미 등록된 카드 입니다.",
                });
              } else {
                const day = new Date();
                const customer_uid =
                  id + day.getHours() + day.getMinutes() + day.getSeconds();
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
                    pg: "nice", // 빌링키 발급에 사용할 PG
                  },
                });
                const { code, message } = issueBilling.data;

                if (code === 0) {
                  // 빌링키 발급 성공
                  if (data.length === 0) {
                    //처음 카드 등록시 결제 카드로 등록
                    db.query(
                      "insert into card (pay_id,id,card_name,card_num,pay_card) values(?,?,?,?,?);",
                      [customer_uid, id, card_name, card_number.substr(0, 6), 1]
                    );
                    resolve({
                      success: true,
                      message: "빌링키 발급 성공",
                    });
                  } else {
                    //다른 카드 등록시 결제 카드로 등록X
                    db.query(
                      "insert into card (pay_id,id,card_name,card_num,pay_card) values(?,?,?,?,?);",
                      [customer_uid, id, card_name, card_number.substr(0, 6), 0]
                    );
                    resolve({
                      success: true,
                      message: "빌링키 발급 성공",
                    });
                  }
                } else {
                  // 빌링키 발급 실패
                  reject({ success: false, message });
                }
              }
            }
          );
        } catch (e) {
          reject({ success: false, message: "401" });
        }
      } else {
        reject({ success: false, message: "이메일 인증 필요" });
      }
    });
  }

  //결제 (수정 필요)
  static paymd(cardInfo) {
    return new Promise((resolve, reject) => {
      try {
        const id = cardInfo.id;
        const day = new Date();
        const merchant_uid = id + day.getTime();
        const name = "Hifive 결제";
        var amount, customer_uid;

        db.query(
          "select user.birth,card.pay_id,card.card_name ,card.pay_card from user,card where user.id=card.id and user.id=? and card.pay_card=1 ",
          [id],
          async (err, data) => {
            if (err) {
              reject({ success: false, message: "결제 실패" });
            } else {
              if (day.getFullYear() - data[0]?.birth.substr(0, 4) >= 19) {
                //어른
                amount = 1200;
              } else if (
                day.getFullYear() - data[0]?.birth.substr(0, 4) >=
                13
              ) {
                //청소년
                amount = 720;
              } else if (day.getFullYear() - data[0]?.birth.substr(0, 4) >= 6) {
                //어린이
                amount = 450;
              }
              customer_uid = data[0]?.pay_id;

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

              const req_pay = await axios({
                url: "https://api.iamport.kr/subscribe/payments/again",
                method: "post",
                headers: {
                  Authorization: access_token,
                },
                data: {
                  customer_uid, // 결제에 필요
                  merchant_uid, // 주문 고유번호
                  amount, // 가격
                  name, //결제명
                },
              });
              db.query(
                "insert into paylist (id,fee,card_name) values(?,?,?);",
                [id, amount, data[0].card_name],
                async (err) => {
                  if (err) {
                    reject({ success: false, message: err });
                  } else {
                    resolve({ success: true, message: amount + "원 결제" });
                  }
                }
              );
            }
          }
        );
      } catch (err) {
        reject({ success: false, message: "401" });
      }
    });
  }

  //결제 내역
  static payListmd(userInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "select date,quit,fee,card_name from paylist where id=? and year(date)=? and month(date)=?",
        [userInfo.id, userInfo.year, userInfo.month],
        async (err, data) => {
          if (err) {
            reject({
              success: false,
              message: "해당 아이디 없음",
            });
          } else {
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
              sum += parseInt(data[i].fee);
            }
            resolve({ success: true, data, total: sum });
          }
        }
      );
    });
  }

  //결제 카드 변경
  static changeCardmd(cardInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "update card set pay_card=0 where id=?",
        [cardInfo.id],
        async (err) => {
          if (err) {
            reject({ success: false, message: "db 오류" });
          } else {
            db.query(
              "update card set pay_card=1 where id=? and card_name=?",
              [cardInfo.id, cardInfo.card_name],
              async (err, data) => {
                if (err) {
                  reject({ success: false, message: "오류" });
                } else if (data.length === 0) {
                  reject({
                    success: false,
                    message: "해당 카드 존재하지 않음",
                  });
                } else {
                  resolve({
                    success: true,
                    message: "결제 카드 변경 성공",
                  });
                }
              }
            );
          }
        }
      );
    });
  }

  //카드 불러오기
  static cardListmd(userInfo) {
    return new Promise(async (resolve, reject) => {
      db.query(
        "select card_name,card_num,pay_card from card where id=?",
        [userInfo.id],
        (err, data) => {
          if (err) {
            reject({ success: false, message: err });
          } else {
            resolve({ success: true, card: data });
          }
        }
      );
    });
  }
}

module.exports = CardModel;
