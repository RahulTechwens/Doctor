const { slot_money } = require("../../../models/");

exports.addMoney = async (paylaod) => {
  let newPayload = { ...paylaod, total_amount: "5000" };
  console.log(newPayload);
  let summationOfMoney = 0;
  const calcMoney = await slot_money.findAll({
    attribute: ["amount"],
    where: {
      user_id: paylaod?.user_id,
    },
    raw: true,
    nest: true,
  });
  if (calcMoney.length > 0) {
    for (let index = 0; index < calcMoney.length; index++) {
      const element = calcMoney[index];
      summationOfMoney += Number(element.amount);
    }
  }
  let summation = Number(summationOfMoney) + Number(paylaod?.amount);

  if (summation > newPayload?.total_amount) {
    return { stats: false, summation: summation };
  } else {
    const add = await slot_money.create({ ...paylaod, total_amount: "5000" });
    return { stats: true, summation: summation };
  }
};

exports.getMoney = async(user_id) =>{
    const money = await slot_money.findOne({
        where:{
            user_id:user_id
        },
    })
    
    return money
}