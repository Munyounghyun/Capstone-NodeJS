const { default: axios } = require("axios");
const db = require("../../config/db");
const crypto = require("crypto");
const { resolve } = require("path");
const util = require("util");
const { captureRejectionSymbol } = require("stream");

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

//비밀번호로 salt 생성함수
const createSalt = async () => {
  const buf = await randomBytesPromise(64);

  return buf.toString("base64");
};

//회원가입시 패스워드 암호화 함수
const createHashedPassword = async (password) => {
  const salt = await createSalt();
  const key = await pbkdf2Promise(password, salt, 100, 64, "sha512");
  const hashedPassword = key.toString("base64");

  return { hashedPassword, salt };
};

//로그인시 암호화 검사함수
const verifyPassword = async (password, userSalt, userPassword) => {
  const key = await pbkdf2Promise(password, userSalt, 100, 64, "sha512");
  const hashedPassword = key.toString("base64");

  if (hashedPassword === userPassword) return true;
  return false;
};

class UsersModel {
  //로그인
  static getUserInfo(id, pwd) {
    return new Promise((resolve, reject) => {
      //아이디, 비밀번호를 입력받았을때
      db.query("select * from user where id=?;", [id], async (err, data) => {
        if (err) reject({ success: false });
        //아이디가 없을경우 에러
        if (data.length === 0) {
          reject({ success: false, message: "아이디 없음" });
        } //아이디 있는경우 비밀번호 확인
        else {
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            resolve({ success: true, message: "로그인 성공" });
          } else {
            reject({ success: false, message: "비밀번호 오류" });
          }
        }
      });
    });
  }

  // 회원가입
  static async save(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      db.query(
        "insert into user(id,pwd,salt,name,phone) values(?,?,?,?,?);",
        [userInfo.id, hashedPassword, salt, userInfo.name, userInfo.phone],
        (err) => {
          if (err) reject({ success: false, message: "해당 아이디 존재함" });
          resolve({ success: true, message: "회원가입 성공" });
        }
      );
    });
  }

  //아이디 찾기
  static async findIdmd(userInfo) {
    return new Promise((resolve, reject) => {
      db.query("select id from user where name=?; ", [userInfo.name], (err) => {
        if (err)
          reject({
            success: false,
            message: "아이디가 존재하지 않습니다. 다시 입력해주세요",
          });
        resolve({ success: true, id: data[0].id });
      });
    });
  }

  //비밀번호 수정
  static async changePwdmd(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      db.query(
        "update user set pwd=?,salt=? where id=?;",
        [hashedPassword, salt, userInfo.id],
        (err) => {
          if (err) reject({ success: false, message: "비밀번호 수정 실패" });
          resolve({ success: true, message: "수정 성공" });
        }
      );
    });
  }

  //회원삭제
  static async deleteUsermd(id, pwd) {
    return new Promise((resolve, reject) => {
      //아이디, 비밀번호를 입력받았을때
      db.query("select * from user where id=?", [id], async (err, data) => {
        if (err) reject({ success: false });
        //해당 회원 없을경우 에러
        else if (data.length === 0) {
          reject({ success: false, message: "아이디 없음" });
        } //아이디 있는경우 비밀번호 확인
        else {
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            db.query("delete from user where id=?", [id], async (err, data) => {
              if (err) reject({ success: false });
              if (data.length === 0) {
                reject({ success: false, message: "해당 회원 존재하지 않음" });
              } else {
                resolve({ success: true, message: "회원 삭제 완료" });
              }
            });
          } else {
            reject({ success: false, message: "비밀번호 오류" });
          }
        }
      });
    });
  }

  //생체정보 등록여부
  static bioRegistmd(userInfo) {
    return new Promise((resolve, reject) => {
      //추후 수정
      db.query(
        "update user set bio_regist=?  bio_method=? where id=?;",
        [userInfo.bio_regist, userInfo.bio_method, userInfo.id],
        (err) => {
          if (err) reject({ success: false });
          resolve({ success: true }, "생체정보가 등록되었습니다."); //생체정보가 등록된 것이 아니라 방법(지문,얼굴)과,등록 여부만 업데이트
        }
      );
    });
  }

  //빌링키 발급
  static cardRegistmd(card_number, expiry, birth, pwd_2digit, id) {
    return new Promise((resolve, reject) => {
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
                db.query("insert into card values(?,?,?);", [
                  customer_uid,
                  id,
                  card_number.substr(0, 6),
                ]);
                resolve({
                  success: true,
                  message: "빌링키 발급 성공",
                });
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
    });
  }

  //결제
  static paymd(cardInfo) {
    return new Promise((resolve, reject) => {
      try {
        const id = cardInfo.id;
        const day = new Date();
        const merchant_uid = id + day.getTime();
        const name = "Hifive 결제";
        var amount, customer_uid;

        db.query(
          "select user.birth,card.pay_id from user,card where user.id=card.id and user.id=?",
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

              const paytest = await axios({
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
                "insert into paylist (id,fee) values(?,?);",
                [id, amount],
                (err) => {
                  reject({ success: false, message: err });
                }
              );
              resolve({ success: true, message: amount + "원 결제" });
            }
          }
        );
      } catch (err) {
        reject({ success: false, message: "401" });
      }
    });
  }

  static payListmd(userInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "select date,fee from paylist where id=?",
        [userInfo.id],
        async (err, data) => {
          if (err) {
            captureRejectionSymbol({
              success: false,
              message: "해당 아이디 없음",
            });
          } else {
            console.log(data);
            resolve({ success: true, data });
          }
        }
      );
    });
  }
}

module.exports = UsersModel;
