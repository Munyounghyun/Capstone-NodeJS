const db = require("../config/db");

class UsersModel {
  static getUserInfo(id) {
    return new Promise((resolve, reject) => {
      db.query("select * from users where id=?", [id], (err, data) => {
        if (err) reject(err);
        resolve(data[0]);
      });
    });
  }

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
