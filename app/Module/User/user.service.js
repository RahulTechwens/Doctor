const { User, UserProfile, Package } = require("../../../models/");
const { Op } = require("sequelize");

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
      saveUser = await User.create(payload);
      await Package.create({
        packageName: `Package 1`,
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
        email: email,
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
      raw: true,
      nest: true,
    });
    return users;
  } catch (error) {
    throw error;
  }
};

exports.packageList = async(userId) =>{
  try {
    const list = Package.findAll({
      where:{
        userId:userId
      }
    });
    return list;
  } catch (error) {
    throw error
  }
}