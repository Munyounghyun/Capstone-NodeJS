const db = require("../config/db");

class UsersModel {
  //로그인 - id 넘겨받아서 해당 유저 있는지 체크
  static getUserInfo(id) {
    return new Promise((resolve, reject) => {
      db.query("select * from users where id=?", [id], (err, data) => {
        if (err) reject(err);
        resolve(data[0]);
      });
    });
  }

  //회원가입
  static save(userInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "insert into users(id,pwd,creditNum) values(?,?,?);",
        [id],
        (err) => {
          if (err) reject({ success: false });
          resolve({ success: true });
        }
      );
    });
  }
}

module.exports = UsersModel;
