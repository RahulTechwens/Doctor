const { User, UserProfile, Package, slot_money, slot_book } = require("../../../models/");
const { Op, where } = require("sequelize");
const envConfig = require("../../Utils/envConfig");

exports.register = async (payload, userProfilePayload) => {
  try {
    let saveUser;

    // const getUser = await User.findOne({
    //   where: {
    //     phone: payload?.phone,
    //   },
    //   raw:true,
    //   nest:true
    // });
    // if (!getUser) {
    // console.log(payload,'payload');
    // return
    saveUser = await User.create(payload);
    await Package.create({
      packageName: payload?.type == 'daily' ? `Daily` : `Package 1`,
      status: false,
      userId: saveUser.id,
    });
    await UserProfile.create({
      ...userProfilePayload,
      user_id: saveUser.id,
    });
    if (saveUser) {
      return true;
    }
    // }
    //  else {
    //   const countPackage = await Package.findAll({
    //     where: {
    //       userId: getUser?.id,
    //     },
    //   });
    //   await Package.create({
    //     packageName: `Package ${Number(countPackage.length) + 1}`,
    //     status: false,
    //     userId: getUser.id,
    //   });
    //   return true;
    // }

    return false;
  } catch (error) {
    throw error;
  }
};

exports.isExsistEmail = async (email) => {
  try {
    const checkEmail = await User.findOne({
      where: {
        email:
          email,
        // {
        //   [Op.and]: [{ [Op.eq]: email }, { [Op.ne]: null }]
        // }der43

      },
    });

    return checkEmail;
  } catch (error) {
    throw error;
  }
};

exports.isExsistPhone = async (phone) => {
  try {
    const checkPhone = await User.findOne({
      where: {
        phone: phone,
      },
    });

    return checkPhone;
  } catch (error) {
    throw error;
  }
};

exports.listUsers = async (search) => {
  try {
    let whereCondition = {};
    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          {
            phone: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            email: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            "$UserProfiles.full_name$": {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      };
    }
    const users = await User.findAll({
      where: whereCondition,
      include: [
        {
          model: UserProfile,
        },
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      raw: true,
      nest: true,
    });
    return users;
  } catch (error) {
    throw error;
  }
};

exports.packageList = async (userId, type) => {
  try {
    const list = Package.findAll({
      where: {
        userId: userId,
        // packageName: {
        //   [Op.like]: `%${type}%`
        // }
      },
      include: [
        {
          model: slot_book,
          attributes: ["id", "is_complete"],
          // required: true
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
    });
    return list;
  } catch (error) {
    throw error
  }
}

exports.isExsistUser = async (id) => {
  try {
    const checkUser = await User.findOne({
      where: {
        id: id,
      },
    });

    return checkUser;
  } catch (error) {
    throw error;
  }
};

exports.updateUser = async (id, payload, userProfilePayload) => {
  try {
    let saveUser;

    const getPackage = await Package.findOne({
      where: {
        userId: id,
        packageName: {
          [Op.like]: `%${payload.type}%`
        }
      },
      raw: true,
      nest: true
    });

    console.log(payload, 'payload', getPackage, "getPackage");
    // return
    saveUser = await User.update(payload, { where: { id: id } });
    if (!getPackage) {
      await Package.create({
        packageName: payload?.type == 'daily' ? `Daily` : `Package 1`,
        status: true,
        userId: id,
      });
    }
    await UserProfile.update({
      ...userProfilePayload,
    }, {
      where: {
        user_id: id,
      }
    });
    if (saveUser) {
      return true;
    }
    // }
    //  else {
    //   const countPackage = await Package.findAll({
    //     where: {
    //       userId: getUser?.id,
    //     },
    //   });
    //   await Package.create({
    //     packageName: `Package ${Number(countPackage.length) + 1}`,
    //     status: false,
    //     userId: getUser.id,
    //   });
    //   return true;
    // }

    return false;
  } catch (error) {
    throw error;
  }
};

exports.packageFound = async (payload) => {
  const getPackage = await Package.findOne({
    where: {
      userId: payload?.id,
      // [Op.and]: fn('LOWER', col('packageName')), payload.type.toLowerCase()
      packageName: {
        [Op.like]: `%${payload.type}%`
      }
    },

    order: [
      ['createdAt', 'DESC'],
    ],
    raw: true,
    nest: true
  });

  // console.log(payload, 'payload', getPackage, "getPackage");
  return getPackage
}

exports.getBookSlots = async (payload) => {
  const getBookSlot = await slot_book.findAll({
    where: payload,
    order: [
      ['createdAt', 'DESC'],
    ],
    raw: true,
    nest: true
  });

  // console.log(payload, 'payload', getPackage, "getPackage");
  return getBookSlot
}

exports.getBookSlotMoney = async (payload) => {
  const getBookSlot = await slot_money.findAll({
    where: payload,
    order: [
      ['createdAt', 'DESC']
    ],
  });
  // console.log(payload, 'payload', getPackage, "getPackage");
  return getBookSlot
}


exports.amountData = async (payload) => {
  const amount = await Package.findOne({
    where: payload,
    include: [
      {
        model: slot_book,
        where: {
          is_complete: { [Op.ne]: "cancelled" },
        },
        // attributes: ["id", "is_complete"],
        // required: true
      },
      {
        model: slot_money,
        // attributes: ["id", "is_complete"],
        // required: true
      }
    ],
    order: [
      ['createdAt', 'DESC'],
      [slot_book, 'createdAt', 'DESC'],
      [slot_money, 'createdAt', 'DESC']
    ],
  });
  let amountDue;
  let amountTotal;
  if (amount?.slot_moneys.length > 0) {
    let amountData = amount?.slot_moneys?.reduce((acc, cur) => acc += Number(cur?.amount), 0);
    const amountTotal = Number(amount?.slot_moneys?.[0]?.total_amount);
    amountDue = amountTotal - amountData
    // console.log(amountData, "amountData", amountDue);

    if (amount?.packageName?.toLowerCase()?.includes('daily') && amount?.slot_moneys?.[0]?.date == amount?.slot_books?.[0]?.date) {
      amountData = amount?.slot_moneys?.reduce((acc, cur) => {
        if (cur?.date == amount?.slot_books?.[0]?.date){

          acc += Number(cur?.amount)
        }
        return acc
      }, 0);
      amountDue = amountTotal - amountData
    console.log(amountData, "amountData", amountDue);


    } else if(amount?.packageName?.toLowerCase()?.includes('daily') && amount?.slot_moneys?.[0]?.date != amount?.slot_books?.[0]?.date){
      amountDue = Number(amount?.slot_moneys?.[0]?.total_amount)
    }
  } else {
    amountDue = amount?.packageName?.toLowerCase()?.includes('daily') ? Number(envConfig.DAILY_AMOUNT) : Number(envConfig.PACKAGE_AMOUNT)
  }
  // console.log(amountDue, "amountDue",amount?.packageName?.toLowerCase()?.includes('daily'));
  let returnData = {
    dueAmount: amountDue,
    amount
  };


  // console.log(payload, 'payload', amount, "amount");
  return returnData
}