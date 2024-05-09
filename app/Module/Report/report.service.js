const { Op } = require("sequelize");
const { slot_money } = require("../../../models/");
const moment = require("moment");

exports.transactionReport = async (from_date, to_date, filter) => {
//   let transaction_report_model;
  if (filter == "custom") {
    if (from_date && to_date) {
      const transaction_report_model_custom = await slot_money.findAll({
        where: {
          date: {
            [Op.between]: [from_date, to_date],
          },
        },
        include: [
          {
            model: User,
          },
        ],
        raw: true,
        nest: true,
      });
      return transaction_report_model_custom;
    }
  }
  if (filter == "today") {
    let todays_date = moment().format("YYYY-MM-DD");
    const transaction_report_model_today = await slot_money.findAll({
      where: {
        date: todays_date,
      },
      raw: true,
      nest: true,
    });
    return transaction_report_model_today;
  }
  if (filter == "all") {
    const transaction_report_model_all = await slot_money.findAll({
      raw: true,
      nest: true,
    });

    return transaction_report_model_all;
  }
};
