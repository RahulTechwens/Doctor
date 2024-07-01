const { Op } = require("sequelize");
const { handleSuccessMessage, handleErrorMessage } = require("../../Utils/responseService");
const { register, isExsistEmail, listUsers, isExsistPhone, packageList, isExsistUser, updateUser, amountData } = require("./user.service");

exports.createUser = async (req, res, next) => {
    try {
        const { email, phone, type, address, full_name } = req.body;
        const userPayload = {
            user_name: full_name,
            email,
            phone,
            type
        }
        const userProfilePayload = {
            address,
            full_name
        }
        if (!phone) {
            return handleErrorMessage(res, 400, "Phone number is required")
        }
        if (email) {
            const chkEmail = await isExsistEmail(email)
            if (chkEmail) {
                return handleErrorMessage(res, 400, "Email already exists")
            }
        }
        const chkPhone = await isExsistPhone(phone)
        console.log(chkPhone, "ch");
        if (chkPhone) {
            return handleErrorMessage(res, 400, "Phone already exists")
        }
        const checkRegister = await register(userPayload, userProfilePayload);
        if (checkRegister) {
            return handleSuccessMessage(res, 200, "Patient registered successfully")
        }

    } catch (error) {
        next(error);
    }
}

exports.listUser = async (req, res, next) => {
    try {

        const search = req?.query?.search

        const users = await listUsers(search);



        return handleSuccessMessage(res, 200, "", users)
    } catch (error) {
        next(error);
    }
}

exports.listPackage = async (req, res, next) => {
    try {
        const userId = req?.params?.userId;

        const chkUser = await isExsistUser(userId);
        if (!chkUser) {
            return handleErrorMessage(res, 404, "User not found")
        }

        // console.log(chkUser, "chkUser");
        // return
        const list = await packageList(userId, chkUser?.type);
        return handleSuccessMessage(res, 200, list)
    } catch (error) {
        next(error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const { id, type, email, address, full_name } = req.body;
        const userPayload = {
            user_name: full_name,
            email,
            type
        }
        const userProfilePayload = {
            address,
            full_name
        }
        const chkUser = await isExsistUser(id)
        if (!chkUser) {
            return handleErrorMessage(res, 404, "User not found")
        }

        const checkRegister = await updateUser(id, userPayload, userProfilePayload);
        if (checkRegister) {
            return handleSuccessMessage(res, 200, "User updated successfully")
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}
// http://13.232.87.199/



exports.userAmount = async (req, res, next) => {
    try {
        const userId = req?.params?.userId;

        const chkUser = await isExsistUser(userId);
        if (!chkUser) {
            return handleErrorMessage(res, 404, "User not found")
        }

        // console.log(chkUser, "chkUser");
        // return
        const dueAmount = await amountData(
            {
                userId: userId,
                // [Op.and]: fn('LOWER', col('packageName')), payload.type.toLowerCase()
                packageName: {
                    [Op.like]: `%${chkUser?.type}%`
                }
            }
        );
        return handleSuccessMessage(res, 200, "Due amount get successfully", dueAmount)

    } catch (error) {
        return next(error);
    }
}