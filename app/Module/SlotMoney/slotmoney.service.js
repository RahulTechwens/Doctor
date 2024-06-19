const { where } = require("sequelize");
const { slot_money, Package, User, Sequelize } = require("../../../models/");
const { use } = require("./slotmoney.route");

exports.addMoney = async (paylaod) => {
  let newPayload = { ...paylaod, total_amount: "5000" };
  console.log(newPayload);
  let summationOfMoney = 0;
  const calcMoney = await slot_money.findAll({
    attribute: ["amount"],
    where: {
      user_id: paylaod?.user_id,
      package_id: paylaod?.package_id
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

exports.getMoney = async (user_id) => {
  const money = await Package.findAll({
    where: {
      userId: user_id,
    },

    include: [
      {

        model: slot_money,
        where: {
          user_id: user_id,
        },
        required: false,
      },
    ],
    attributes: ["id",
      "packageName",
      "status",
      // [
      //   Sequelize.literal(`
      //     5000 - COALESCE((SELECT SUM(sm.amount) 
      //     FROM
      //      slot_moneys sm 
      //     WHERE
      //      sm.user_id = ${user_id} AND sm.package_id = Package.id), 0)`),
      //   'dueMoney'
      // ],
      [
        Sequelize.literal(`(
          SELECT 
            COALESCE(MAX(sm.total_amount), 5000) - COALESCE(SUM(sm.amount), 0) 
          FROM 
            slot_moneys sm 
          WHERE 
            sm.user_id = ${user_id} AND sm.package_id = Package.id
        )`),
        'dueMoney'
      ],
      
    ],
    order: [
      ['createdAt', 'DESC']
    ],
    nest: true,
  });
  console.log(money);
  return money;
};

exports.getPackage = async (package_id) => {
  try {
    const package = await Package.findOne({
      where: {
        id: package_id,
      },
      raw: true,
      nest: true,
    });

    return package;
  } catch (error) {
    throw error;
  }
};

exports.getUser = async (user_id) => {
  try {
    const user = await User.findOne({
      where: {
        id: user_id,
      },
      raw: true,
      nest: true,
    });

    return user;
  } catch (error) {
    throw error;
  }
};
