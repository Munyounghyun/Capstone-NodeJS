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

module.exports = {
  userspage,
  login,
  signup,
};
