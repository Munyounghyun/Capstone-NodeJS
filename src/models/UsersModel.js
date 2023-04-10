const { rejects } = require("assert");
const db = require("../config/db");
const crypto = require("crypto");
const { resolve } = require("path");
const util = require("util");

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
  static getUserInfo(id, pwd, hand) {
    return new Promise((resolve, reject) => {
      //아이디, 비밀번호를 입력받았을때
      if (hand == undefined || hand === "") {
        db.query("select * from test where id=?", [id], async (err, data) => {
          if (err) reject(`${err}`);
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            resolve(data[0]);
          } else {
            reject("비밀번호 오류");
          }
        });
      } else {
        // 지문을 입력받았을때
        db.query(
          "select * from test where hand=?",
          [hand],
          async (err, data) => {
            if (err) reject(`${err}`);
            else if (data[0] == undefined) reject("인식 오류");
            else resolve(data[0]);
          }
        );
      }
    });
  }
  // 회원가입
  static async save(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      db.query(
        "insert into test(id,pwd,salt,name,credit_number) values(?,?,?,?,?);",
        [
          userInfo.id,
          hashedPassword,
          salt,
          userInfo.name,
          userInfo.credit_number,
        ],
        (err) => {
          if (err) reject(`${err}`);
          resolve({ success: true });
        }
      );
    });
  }

  //지문 등록
  static handRegistmd(userInfo) {
    return new Promise((resolve, reject) => {
      //추후 수정
      db.query(
        "update test set hand=? where id=?;",
        [userInfo.hand, userInfo.id],
        (err) => {
          if (err) reject(`${err}`);
          resolve({ success: true }, "지문등록 성공");
        }
      );
    });
  }

  //추후 작성 - 카드 등록
  static payregistmd(cardInfo) {}
}

module.exports = UsersModel;
