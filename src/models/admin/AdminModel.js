const db = require("../../config/db");
const crypto = require("crypto");
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

class AdminModel {
  //로그인
  static getAdminInfo(id, pwd) {
    return new Promise((resolve, reject) => {
      //아이디, 비밀번호를 입력받았을때
      db.query("select * from test where id=?;", [id], async (err, data) => {
        if (err) reject({ success: false });
        //아이디가 없을경우 에러
        if (data.length === 0) {
          reject({ success: false, message: "아이디 없음" });
        } //아이디 있는경우 비밀번호 확인
        else {
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            resolve(data[0], { success: true });
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
        "insert into test(id,pwd,salt,name,credit_number,authority) values(?,?,?,?,?,?);",
        [
          userInfo.id,
          hashedPassword,
          salt,
          userInfo.name,
          userInfo.credit_number,
          "관리자",
        ],
        (err) => {
          if (err) reject({ success: false, message: "해당 아이디 존재함" });
          resolve({ success: true });
        }
      );
    });
  }

  //비밀번호 수정
  static async changePwdmd(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      db.query(
        "update test set pwd=?,salt=? where id=?;",
        [hashedPassword, salt, userInfo.id],
        (err) => {
          if (err) reject({ success: false, message: "비밀번호 수정 실패" });
          resolve({ success: true, message: "수정 성공" });
        }
      );
    });
  }
}

module.exports = AdminModel;
