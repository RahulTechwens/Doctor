const { User, UserProfile, Package, slot_money, slot_book } = require("../../../models/");
const { Op, where } = require("sequelize");

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
        {
          [Op.and]: [{ [Op.eq]: email }, { [Op.ne]: "" }]
        }
        // email,
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

exports.packageList = async (userId) => {
  try {
    const list = Package.findAll({
      where: {
        userId: userId
      },
      include: [
        {
          model: slot_book,
          attributes: ["id"],
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