const UsersModel = require("./UsersModel");

class User {
  constructor(body) {
    this.body = body;
  }
  //로그인
  async login() {
    const body = this.body;
    try {
      const { id, pwd } = await UsersModel.getUserInfo(body.id);

      if (id) {
        if (id === body.id && pwd === body.pwd) {
          return { success: true };
        }
        return { success: false }; //비밀번호 틀림
      }
      return { success: false }; //존재하는 아이디 없음
    } catch (err) {
      return { success: false };
    }
  }

  //회원가입
  register() {
    const response = UsersModel.save(this.body);
    return response;
  }
}

module.exports = User;
