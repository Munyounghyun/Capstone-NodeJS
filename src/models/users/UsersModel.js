const db = require("../../config/db");
const crypto = require("crypto");
const util = require("util");
const nodemailer = require("nodemailer");

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
        if (err) reject({ success: false, message: "DB 오류" });
        //아이디가 없을경우 에러
        if (data.length === 0) {
          reject({
            success: false,
            message: "아이디 없음",
            name: "null",
            email: "null",
          });
        } //아이디 있는경우 비밀번호 확인
        else {
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            resolve({
              success: true,
              message: "로그인 성공",
              name: data[0].name,
              email: data[0].email,
            });
          } else {
            reject({
              success: false,
              message: "비밀번호 오류",
              name: "",
              email: "",
            });
          }
        }
      });
    });
  }

  // 회원가입
  static async save(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      if (userInfo.certification === true) {
        db.query(
          "insert into user(id,pwd,salt,name,email,birth) values(?,?,?,?,?,?);",
          [
            userInfo.id,
            hashedPassword,
            salt,
            userInfo.name,
            userInfo.email,
            userInfo.birth,
          ],
          (err) => {
            if (err) reject({ success: false, message: "회원가입 실패" });
            resolve({ success: true, message: "회원가입 성공" });
          }
        );
      } else {
        reject({ success: false, message: "이메일 인증 필요" });
      }
    });
  }

  //이메일 보내기
  static async auth(userInfo) {
    return new Promise((resolve, reject) => {
      const email = userInfo.email;
      db.query("delete from email where email=?", [email], (err) => {
        if (err) {
          reject({ success: false, message: err });
        }
      });
      //6자리 난수
      const authNumber = Math.floor(Math.random() * 888888) + 111111;
      //보낼 gmail 세팅
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_ID,
          pass: process.env.GMAIL_PWD,
        },
      });
      //보낼 내용 세팅
      const message = {
        from: process.env.GMAIL_ID,
        to: email,
        subject: "HiFive 이메일 인증코드",
        html: "<p>HiFive 이메일 인증코드 : <h1>" + authNumber + "</h1></p>",
      };

      transporter.sendMail(message, (err) => {
        if (err) {
          reject({ success: false, message: "이메일 전송 실패" });
        } else {
          db.query(
            "insert into email values(?,?);",
            [email, authNumber],
            (err) => {
              if (err) {
                reject({ success: false, message: "인증 정보 저장 실패" });
              } else {
                setTimeout(() => {
                  db.query(
                    "delete from email where email=? and auth_number=?",
                    [email, authNumber],
                    (err) => {
                      if (err) {
                        reject({ success: false, message: "이메일 삭제 실패" });
                      }
                    }
                  );
                }, 180000);
                resolve({
                  success: true,
                  message: "이메일 전송 성공 - 3분 뒤 삭제",
                });
              }
            }
          );
        }
      });
    });
  }

  //이메일 인증 체크
  static async authCheck(userInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "select * from email where auth_number=? and email=? ;",
        [userInfo.auth_number, userInfo.email],
        (err, data) => {
          if (err) {
            reject({ success: false, message: "이메일 인증 실패" });
          } else {
            if (data.length !== 0) {
              db.query(
                "delete from email where auth_number=? and email=?;",
                [userInfo.auth_number, userInfo.email],
                (err) => {
                  if (err) {
                    reject({ success: false, message: err });
                  } else {
                    resolve({ success: true, message: "이메일 인증 성공" });
                  }
                }
              );
            } else {
              reject({ success: false, message: "이메일 인증 실패" });
            }
          }
        }
      );
    });
  }

  //아이디 찾기
  static async findIdmd(userInfo) {
    return new Promise((resolve, reject) => {
      if (Boolean(userInfo.certification) === true) {
        db.query(
          "select id from user where name=? and email=?; ",
          [decodeURIComponent(userInfo.name), userInfo.email],
          (err, data) => {
            if (err)
              reject({
                success: false,
                message: "아이디가 존재하지 않습니다. 다시 입력해주세요",
              });
            resolve({ success: true, id: data[0].id });
          }
        );
      } else {
        reject({ success: false, message: "이메일 인증 필요" });
      }
    });
  }

  //비밀번호 수정
  static async changePwdmd(userInfo) {
    const { hashedPassword, salt } = await createHashedPassword(userInfo.pwd);
    return new Promise((resolve, reject) => {
      if (userInfo.certification === true) {
        db.query(
          "update user set pwd=?,salt=? where id=?;",
          [hashedPassword, salt, userInfo.id],
          (err) => {
            if (err) reject({ success: false, message: "비밀번호 수정 실패" });
            resolve({ success: true, message: "수정 성공" });
          }
        );
      } else {
        reject({ success: false, message: "이메일 인증 필요" });
      }
    });
  }

  //회원삭제
  static deleteUsermd(id, pwd) {
    return new Promise((resolve, reject) => {
      //아이디, 비밀번호를 입력받았을때
      db.query("select * from user where id=?", [id], async (err, data) => {
        if (err) reject({ success: false, message: err });
        //해당 회원 없을경우 에러
        else if (data.length === 0) {
          reject({ success: false, message: "아이디 없음" });
        } //아이디 있는경우 비밀번호 확인
        else {
          const checkPwd = await verifyPassword(pwd, data[0].salt, data[0].pwd);
          if (checkPwd) {
            db.query("delete from user where id=?", [id], async (err, data) => {
              if (err) reject({ success: false, message: err });
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
          if (err) reject({ success: false, message: "생체정보 등록 실패" });
          resolve({ success: true, message: "생체정보가 등록되었습니다." }); //생체정보가 등록된 것이 아니라 방법(지문,얼굴)과,등록 여부만 업데이트
        }
      );
    });
  }

  //정맥 등록
  static registVeinmd(userInfo) {
    return new Promise(async (resolve, reject) => {
      try {
        //const photoData = await captureAndReceivePhoto(); //함수 수정해야함

        //작업 내용들...
        db.query(
          "select vein from user where vein=?",
          [userInfo.vein],
          (err) => {
            if (err) {
              reject({ success: false, message: "정맥 인식 실패" });
            } else {
              if (data[0].length === 0) {
                //db에 해당 정맥 없음
                db.query(
                  "update user set vein=? where =?",
                  [userInfo.vein, userInfo.id],
                  (err) => {
                    if (err)
                      reject({ success: false, message: "정맥등록 실패" });
                    resolve({ success: true, message: "정맥 등록 성공" });
                  }
                );
              } else {
                //db에 해당 정맥 있음
                reject({ success: false, message: "해당 정맥 존재" });
              }
            }
          }
        );
      } catch (err) {
        reject({ success: false, message: err });
      }
    });
  }
}

module.exports = UsersModel;
