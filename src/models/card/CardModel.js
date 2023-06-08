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
    certification
  ) {
    return new Promise((resolve, reject) => {
      if (certification === true) {
        try {
          //이미 동일한 카드가 등록되어있는지 검색
          db.query(
            "select card_num from card where card_num=? and id=?",
            [card_number.substr(0, 6) + "******" + card_number.substr(12), id],
            async (err, data) => {
              if (err) {
                reject({ success: false, message: err });
              } else if (data.length !== 0) {
                reject({ success: false, message: "이미 등록된 카드 입니다." });
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
                  //카드 이름 찾기
                  db.query(
                    "select card_name from cardlist where card_bin=?",
                    [card_number.substr(0, 6)],
                    (err, data) => {
                      if (err) {
                        reject({
                          success: false,
                          message: "DB에 등록되지 않은카드, KB카드는 등록 불가",
                        });
                      } else {
                        var card_name;
                        if (data[0]?.card_name !== undefined) {
                          card_name = data[0].card_name;
                        } else {
                          card_name = "db에 등록되어 있지 않은 카드";
                        }
                        //등록된 카드가 있는지 검색
                        db.query(
                          "select * from card where id=?",
                          [id],
                          (err, data) => {
                            if (err) {
                              reject({ success: false, message: "db오류" });
                            } else if (data.length === 0) {
                              //처음 카드 등록시 결제 카드로 등록
                              db.query(
                                "insert into card (pay_id,id,card_name,card_num,pay_card) values(?,?,?,?,?);",
                                [
                                  customer_uid,
                                  id,
                                  card_name,
                                  card_number.substr(0, 6) +
                                    "******" +
                                    card_number.substr(12),
                                  1,
                                ]
                              );
                              resolve({
                                success: true,
                                message: "빌링키 발급 성공",
                              });
                            } else {
                              //다른 카드 등록시 결제 카드로 등록X
                              db.query(
                                "insert into card (pay_id,id,card_name,card_num,pay_card) values(?,?,?,?,?);",
                                [
                                  customer_uid,
                                  id,
                                  card_name,
                                  card_number.substr(0, 6) +
                                    "******" +
                                    card_number.substr(12),
                                  0,
                                ]
                              );
                              resolve({
                                success: true,
                                message: "빌링키 발급 성공",
                              });
                            }
                          }
                        );
                      }
                    }
                  );
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

  //카드 삭제
  static deleteCardmd(cardInfo) {
    console.log(cardInfo);
    return new Promise((resolve, reject) => {
      try {
        //아이디와 카드번호를 이용하여 빌링키 찾기
        db.query(
          "select pay_id from card where id=? and card_num=?",
          [cardInfo.id, cardInfo.card_num],
          async (err, data) => {
            console.log(data);
            if (err) {
              reject({ success: false, message: "카드 삭제 실패" });
            } else {
              const customer_uid = data[0].pay_id;

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

              // 빌링키 삭제 요청
              const issueBilling = await axios({
                url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
                // 인증 토큰 Authorization header에 추가
                headers: { Authorization: access_token },
                method: "delete",
              });
              const { code, message } = issueBilling.data;
              if (code == 0) {
                //카드 삭제 완료
                db.query(
                  "delete from card where pay_id=?",
                  [customer_uid],
                  (err) => {
                    if (err) {
                      reject({ success: true, message: "카드 삭제 실패" });
                    } else {
                      resolve({ success: false, message: "카드 삭제 성공" });
                    }
                  }
                );
              } else {
                reject({ success: false, message });
              }
            }
          }
        );
      } catch (err) {
        reject({ success: false, message: err });
        console.log(err);
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

        //아이디를 이용하여 결제 카드 불러오기
        db.query(
          "select user.birth,card.pay_id,card.card_name ,card.pay_card from user,card where user.id=card.id and user.id=? and card.pay_card=1 ",
          [id],
          async (err, data) => {
            if (err) {
              reject({ success: false, message: "결제 실패" });
            } else {
              //어른
              if (day.getFullYear() - data[0]?.birth.substr(0, 4) >= 19) {
                amount = 1200;
              }
              //청소년
              else if (day.getFullYear() - data[0]?.birth.substr(0, 4) >= 13) {
                amount = 720;
              }
              //어린이
              else if (day.getFullYear() - data[0]?.birth.substr(0, 4) >= 6) {
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
              //결제 성공시 결제 내역에 추가
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
      //먼저 등록된 카드 전부 결제 카드가 아니게 변경
      db.query(
        "update card set pay_card=0 where id=?",
        [cardInfo.id],
        async (err) => {
          if (err) {
            reject({ success: false, message: "db 오류" });
          } else {
            //선택한 카드를 결제카드로 변경
            db.query(
              "update card set pay_card=1 where id=? and card_num=?",
              [cardInfo.id, cardInfo.card_num],
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
        "select card.card_name,card.card_num,card.pay_card,cardlist.url " +
          "from card,cardlist " +
          "where card.card_name=cardlist.card_name and id=? AND cardlist.card_bin=SUBSTR(card.card_num,1,6);  ",
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
