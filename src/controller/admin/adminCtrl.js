const Admin = require("../../models/admin/Admin");

const adminControl = (req, res, next) => {
  res.json({ admin: "admin" });
};

//관리자 로그인
const loginCtrl = async (req, res) => {
  const user = new Admin(req.body);
  const response = await user.login();
  return res.json(response);
};

//관리자 회원가입
const registerCtrl = async (req, res) => {
  const user = new Admin(req.body);
  const response = await user.register();
  return res.json(response);
};

module.exports = {
  adminControl,
  loginCtrl,
  registerCtrl,
};
