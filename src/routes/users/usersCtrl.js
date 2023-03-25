//dubby data///////////////////////////////
const User = require("../../models/User");
//////////////////////////////////////////////

const userspage = (req, res) => {
  res.send("유저페이지");
};

const login = async (req, res) => {
  const user = new User(req.body);
  const response = await user.login();
  return res.json(response);
};

//회원가입
const signup = (req, res, next) => {
  const user = new User(req.body);
  const response = user.register();
  return res.json(response);
};
// var maria = require("../../db/connect"); // 나중에 빼줄것
// const signup = (req, res, next) => {
//   const name = req.body.name;
//   const id = req.body.id;
//   const pwd = req.body.pwd;
//   const pwd2 = req.body.pwd2;
//   const security_num = req.body.security_num;

//   maria.query(
//     //빼줄것
//     "select * from users where id= ?",
//     [id],
//     (err, results, fields) => {
//       if (err) {
//         throw err;
//       }
//       if (results.length <= 0 && pwd == pwd2) {
//         maria.query(
//           "insert into 테이블명 (name,id,pwd,security_num) values(?,?,?,?)",
//           [name, id, pwd, security_num],
//           (err, data) => {
//             if (err) {
//               throw err;
//             }
//           }
//         );
//       } else {
//         response.send("회원가입 실패");
//       }
//     }
//   );
// };

module.exports = {
  userspage,
  login,
  signup,
};
