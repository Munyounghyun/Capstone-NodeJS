const AdminModel = require("./AdminModel");

class Admin {
  constructor(body) {
    this.body = body;
  }

  //로그인 테스트
  async login() {
    const body = this.body;
    try {
      const response = await AdminModel.getAdminInfo(body.id, body.pwd);
      return response;
    } catch (err) {
      return err;
    }
  }

  //회원가입
  async register() {
    try {
      const response = await AdminModel.save(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //비밀번호 수정
  async changePwd() {
    try {
      const response = await AdminModel.changePwdmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Admin;
