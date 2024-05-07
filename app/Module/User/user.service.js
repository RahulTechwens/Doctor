const { User, UserProfile } = require("../../../models/");
const { Op } = require("sequelize");

exports.register = async (payload, userProfilePayload) => {
  try {
    const saveUser = await User.create(payload);
    if (saveUser) {
      const lastInsertedUser = await User.findAll({
        limit: 1,
        order: [["createdAt", "DESC"]],
        raw: true,
        nest: true,
      });
      await UserProfile.create({
        ...userProfilePayload,
        user_id: lastInsertedUser[0]?.id,
      });
    }
    if (saveUser) {
      return true;
    }
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
