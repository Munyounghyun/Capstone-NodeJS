const db = require("../config/db");

class UsersModel {
  //로그인 - id 넘겨받아서 해당 유저 있는지 체크
  static getUserInfo(id) {
    return new Promise((resolve, reject) => {
      db.query("select * from hifive where id = ?", [id], (err, data) => {
        if (err) reject(`${err}`);
        resolve(data[0]);
      });
    });
  }

  //회원가입
  static save(userInfo) {
    return new Promise((resolve, reject) => {
      db.query(
        "insert into hifive(id,pwd,name,credit_number) values(?,?,?,?);",
        [userInfo.id, userInfo.pwd, userInfo.name, userInfo.credit_number],
        (err) => {
          if (err) reject(`${err}`);
          resolve({ success: true });
        }
      );
    });
  }
}

module.exports = UsersModel;
