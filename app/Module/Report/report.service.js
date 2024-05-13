const { Op } = require("sequelize");
const {
  slot_money,
  User,
  UserProfile,
  slot_book,
  slot_entries,
} = require("../../../models/");
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
            include: [
              {
                model: UserProfile,
              },
            ],
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
      include: [
        {
          model: User,
          include: [
            {
              model: UserProfile,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });
    return transaction_report_model_today;
  }
  if (filter == "all") {
    const transaction_report_model_all = await slot_money.findAll({
      include: [
        {
          model: User,
          include: [
            {
              model: UserProfile,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    return transaction_report_model_all;
  }
};

exports.patientBookngReport = async (from_date, to_date, filter) => {
  if (filter == "custom") {
    if (from_date && to_date) {
      const patient_bookng_report_model_custom = await slot_book.findAll({
        where: {
          date: {
            [Op.between]: [from_date, to_date],
          },
        },
        include: [
          {
            model: slot_entries,
          },
          {
            model: User,
            include: [
              {
                model: UserProfile,
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });
      return patient_bookng_report_model_custom;
    }
  }
  if (filter == "today") {
    let todays_date = moment().format("YYYY-MM-DD");
    const patient_bookng_report_model_today = await slot_book.findAll({
      where: {
        date: todays_date,
      },
      include: [
        {
          model: slot_entries,
        },
        {
          model: User,
          include: [
            {
              model: UserProfile,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });
    return patient_bookng_report_model_today;
  }
  if (filter == "all") {
    const patient_bookng_report_model_all = await slot_book.findAll({
      include: [
        {
          model: slot_entries,
        },
        {
          model: User,
          include: [
            {
              model: UserProfile,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });
    return patient_bookng_report_model_all;
  }
};
