const User = require("../../models/users/User");

const userspage = (req, res) => {
  res.send("유저페이지");
};

//로그인
const login = async (req, res) => {
  const user = new User(req.body);
  const response = await user.login();
  return res.json(response);
};

//회원가입
const signup = async (req, res) => {
  const user = new User(req.body);
  const response = await user.register();
  return res.json(response);
};

//이메일 보내기
const auth = async (req, res) => {
  const user = new User(req.body);
  const response = await user.auth();
  return res.json(response);
};

//이메일 인증
const auth_check = async (req, res) => {
  const user = new User(req.body);
  const response = await user.authCheck();
  return res.json(response);
};

//아이디 찾기
const findId = async (req, res) => {
  const user = new User(req.query);
  const response = await user.findId();
  return res.json(response);
};

//비밀번호 수정
const changePwd = async (req, res) => {
  const user = new User(req.body);
  const response = await user.changePwd();
  return res.json(response);
};

//회원 삭제
const deleteUser = async (req, res) => {
  const user = new User(req.body);
  const response = await user.deleteUser();
  return res.json(response);
};

//생체정보 등록여부
const bioRegist = async (req, res) => {
  const user = new User(req.body);
  const response = await user.bioRegist();
  return res.json(response);
};

//정맥 등록
const registVein = async (req, res) => {
  const user = new User(req.body);
  const response = await user.registVein();
  return res.json(response);
};

module.exports = {
  userspage,
  login,
  signup,
  auth,
  auth_check,
  findId,
  changePwd,
  bioRegist,
  deleteUser,
  registVein,
};
