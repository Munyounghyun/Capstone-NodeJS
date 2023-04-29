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

  //비밀번호 수정
  async changePwd() {
    try {
      const response = await UsersModel.changePwdmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //회원삭제
  async deleteUser() {
    const body = this.body;
    try {
      const response = await UsersModel.deleteUsermd(body.id, body.pwd);
      return response;
    } catch (err) {
      return err;
    }
  }

  //생체정보 등록여부
  async bioRegist() {
    try {
      const response = await UsersModel.bioRegistmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //카드 등록
  async cardRegist() {
    try {
      const response = await UsersModel.cardRegistmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }
}

module.exports = User;
