const adminControl = (req, res, next) => {
  res.json({ admin: "admin" });
};

const loginCtrl = (req, res) => {
  res.jseon({ message: "로그인 기능입니다." });
};

module.exports = {
  adminControl,
  loginCtrl,
};
