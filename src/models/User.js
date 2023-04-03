const UsersModel = require("./UsersModel");

class User {
  constructor(body) {
    this.body = body;
  }

  //로그인 테스트
  async login() {
    const body = this.body;
    try {
      const response = await UsersModel.getUserInfo(body.id, body.pwd);
      return response;
    } catch (err) {
      return err;
    }
  }

  //회원가입
  async register() {
    try {
      const response = await UsersModel.save(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }
  //카드 등록
  async payregist() {
    try {
      const response = await UsersModel.payregistmode(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }
}

module.exports = User;
