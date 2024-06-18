const { handleSuccessMessage, handleErrorMessage } = require("../../Utils/responseService");
const { register, isExsistEmail, listUsers, isExsistPhone, packageList } = require("./user.service");

exports.createUser = async (req, res, next) =>{
    try {
        const { email, phone, type, address, full_name} = req.body;
        const userPayload = {
            user_name:full_name,
            email,
            phone,
            type
        }
        const userProfilePayload = {
            address,
            full_name
        }
        const chkEmail = await isExsistEmail(email)
        if (chkEmail) {
            return handleErrorMessage(res, 400, "Email already exists")
        }
        const chkPhone = await isExsistPhone(phone)
        if (chkPhone) {
            return handleErrorMessage(res, 400, "Phone already exists")
        }
        const checkRegister = await register(userPayload,userProfilePayload);
        if (checkRegister) {
            return handleSuccessMessage(res, 200, "User created successfully")
        }

    } catch (error) {
        next(error);
    }
}

exports.listUser = async (req, res, next) =>{
    try {

        const search = req?.query?.search

        const users = await listUsers(search);



        return handleSuccessMessage(res, 200, "", users)
    } catch (error) {
        next(error);
    }
}

exports.listPackage = async (req, res, next) =>{
    try {
        const userId = req?.params.userId
        const list = await packageList(userId);
        return handleSuccessMessage(res, 200, list)
    } catch (error) {
        next(error)
    }
}
// http://13.232.87.199/