const { Op, where } = require("sequelize");
const {
  slot_money,
  User,
  UserProfile,
  slot_book,
  slot_entries,
  Package,
} = require("../../../models/");
const moment = require("moment");
const { getPagination } = require("../../Utils/pagination");

exports.transactionReport = async (
  from_date,
  to_date,
  filter,
  offset,
  limit,
  userId
) => {
  //   let transaction_report_model;
  let getOffset, getLimit;
  let whereCondition = {};
  if ((limit, offset)) {
    const paginate = getPagination(offset, limit);
    getOffset = Number(paginate.offset);
    getLimit = Number(paginate.limit);
  }
  if (filter == "custom") {
    if (from_date && to_date) {
      whereCondition = {
        ...whereCondition,
        date: {
          [Op.between]: [from_date, to_date],
        },
      };
    }
  }
  if (filter == "today") {
    let todays_date = moment().format("YYYY-MM-DD");
    whereCondition = { ...whereCondition, date: todays_date };
  }
  if (filter == "all") {
    whereCondition = {};
  }
  if (userId) {
    whereCondition = {
      ...whereCondition,
      user_id: userId,
    };
  }
  const transaction_report_model_all = await slot_money.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Package,
        required: true
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
    order: [
      ['createdAt', 'DESC']
    ],
    offset: getOffset,
    limit: getLimit,
    raw: true,
    nest: true,
  });
  return transaction_report_model_all;
};

exports.patientBookngReport = async (
  from_date,
  to_date,
  filter,
  offset,
  limit,
  userId
) => {
  let getOffset, getLimit;
  let whereCondition = {};

  if ((limit, offset)) {
    const paginate = getPagination(offset, limit);
    getOffset = Number(paginate.offset);
    getLimit = Number(paginate.limit);
  }
  console.log(getOffset, getLimit);

  if (filter == "custom") {
    if (from_date && to_date) {
      whereCondition = {
        ...whereCondition,
        date: {
          [Op.between]: [from_date, to_date],
        },
      };
    }
  }
  if (filter == "today") {
    let todays_date = moment().format("YYYY-MM-DD");
    whereCondition = { ...whereCondition, date: todays_date };
  }
  if (filter == "all") {
    whereCondition = {};
  }
  if (userId) {
    whereCondition = {
      ...whereCondition,
      user_id: userId,
    };
  }
  const patient_bookng_report = await slot_book.findAll({
    where: whereCondition,
    include: [
      {
        model: Package,
      },
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
    order: [
      ['createdAt', 'DESC']
    ],
    offset: getOffset || 0,
    limit: getLimit || 10,
    raw: true,
    nest: true,
  });

  console.log(patient_bookng_report, "patient_bookng_report");

  return patient_bookng_report;

};


exports.userInfoBySlotBooked = async (
  from_date,
  to_date,
  filter,
  type,
  offset,
  limit,
  userId
) => {
  let getOffset, getLimit;
  let whereCondition = {};
  let whereConds = {};
  if ((limit, offset)) {
    const paginate = getPagination(offset, limit);
    getOffset = Number(paginate.offset);
    getLimit = Number(paginate.limit);
  }
  if (userId) {
    whereCondition = { ...whereCondition, id: userId }
  }
  if (filter == "custom") {
    if (from_date && to_date) {
      whereConds = {
        ...whereConds,
        date: {
          [Op.between]: [from_date, to_date],
        },
      };
    }
  }
  if (filter == "today") {
    let todays_date = moment().format("YYYY-MM-DD");
    whereConds = { ...whereConds, date: todays_date };
  }
  if (filter == "all") {
    whereConds = {};
  }
  let userinfo
  if (type == "Booking") {
    userinfo = await User.findAll({
      where: whereCondition,
      include: [
        {
          model: slot_book,
          where: whereConds,
          attributes: [],
          // attributes: ["id", "date", "package_id", "is_complete"],
          required: true
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        // [slot_book,'createdAt', 'DESC']
      ],
      attributes: ["id", "user_name", "phone", "email", "type", "createdAt"],
      offset: getOffset || 0,
      limit: getLimit || 10,
      // raw: true,
      // nest: true,
    })
  } else {
    userinfo = await User.findAll({
      where: whereCondition,
      include: [
        {
          model: slot_money,
          where: whereConds,
          attributes: [],
          // attributes: ["id", "date", "package_id", "is_complete"],
          required: true
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        // [slot_book,'createdAt', 'DESC']
      ],
      attributes: ["id", "user_name", "phone", "email", "type", "createdAt"],

      offset: getOffset || 0,
      limit: getLimit || 10,
      // raw: true,
      // nest: true,
    })
  }

  return userinfo;
}