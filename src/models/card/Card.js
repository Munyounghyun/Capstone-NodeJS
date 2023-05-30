const CardModel = require("./CardModel");

class Card {
  constructor(body) {
    this.body = body;
  }

  //카드 등록
  async cardRegist() {
    const body = this.body;
    try {
      const response = await CardModel.cardRegistmd(
        body.card_number,
        body.expiry,
        body.birth,
        body.pwd_2digit,
        body.id,
        body.card_name,
        body.certification
      );
      return response;
    } catch (err) {
      return err;
    }
  }

  //카드 삭제
  async deleteCard() {
    try {
      const response = await CardModel.deleteCardmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //결제
  async pay() {
    try {
      const response = await CardModel.paymd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //결제 내역
  async paylist() {
    try {
      const response = await CardModel.payListmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //결제 카드 변경
  async changeCard() {
    try {
      const response = await CardModel.changeCardmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }

  //카드 불러오기
  async cardList() {
    try {
      const response = await CardModel.cardListmd(this.body);
      return response;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Card;
