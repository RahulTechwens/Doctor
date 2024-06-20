const { handleSuccessMessage } = require("../../Utils/responseService")
const { addMoney, getMoney, getPackage, getUser } = require("./slotmoney.service")

exports.addSlotMoney = async (req, res, next) => {
    try {
        const { date, time, amount, user, package_id } = req?.body
        const payload = {
            date, time, amount, user_id: user, package_id
        }
        const checkPackage = await getPackage(payload?.package_id);
        if (!checkPackage) {
            return res.status(404).json({
                'status': 404,
                'success': false,
                'message': 'Package not found.'
            })
        }

        const checkUser = await getUser(payload?.user_id)

        if (!checkUser) {
            return res.status(404).json({
                'status': 404,
                'success': false,
                'message': 'User not found.'
            })
        }
        if (checkPackage?.packageName.includes("Daily")) {
            payload.type = "Daily"
        }
        const moneyAdd = await addMoney(payload)
        if (moneyAdd.stats) {
            return res.status(200).json({
                'status': 200,
                'success': true,
                'message': 'Money Added Successful',
                'data': moneyAdd.summation
            })
        } else {
            return res.status(200).json({
                'status': 200,
                'success': true,
                'message': 'Paid amount cannot be greater than Total amount',
                'dueblance': moneyAdd?.dueBlance
            })
        }
    } catch (error) {
        next(error)
    }
}

exports.getSlotMoney = async (req, res, next) => {
    try {
        const user_id = req?.query?.user_id;
        const getMoneyUserId = await getMoney(user_id)
        if (getMoneyUserId) {
            return res.status(200).json({
                'status': 200,
                'success': true,
                'data': getMoneyUserId
            })
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}