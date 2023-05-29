const Card = require("../../models/card/Card");

//카드 등록
const cardRegist = async (req, res) => {
  const card = new Card(this.body);
  const response = await card.cardRegist();
  return res.json(response);
};

//결제
const pay = async (req, res) => {
  const card = new Card(req.body);
  const response = await card.pay();
  return res.json(response);
};

//결제 내역
const paylist = async (req, res) => {
  const card = new Card(req.query);
  const response = await card.paylist();
  return res.json(response);
};

//결제 카드 변경
const changeCard = async (req, res) => {
  const card = new Card(req.body);
  const response = await card.changeCard();
  return res.json(response);
};

//카드 불러오기
const cardList = async (req, res) => {
  const card = new Card(req.query);
  const response = await card.cardList();
  return res.json(response);
};

module.exports = {
  cardRegist,
  pay,
  paylist,
  changeCard,
  cardList,
};
