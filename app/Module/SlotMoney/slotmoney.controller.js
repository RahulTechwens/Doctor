const { Op } = require("sequelize")
const { handleSuccessMessage, handleErrorMessage } = require("../../Utils/responseService")
const { checkbookingSlot } = require("../SlotBook/slotbook.service")
const { addMoney, getMoney, getPackage, getUser } = require("./slotmoney.service")

exports.addSlotMoney = async (req, res, next) => {
    try {
        const { date, time, amount, user, package_id } = req?.body
        const payload = {
            date, time, amount, user_id: user, package_id
        }
        if (amount <= 0) {
            return handleErrorMessage(res, 400, "Paid amount should not be 0");
        }
        console.log(amount, "amount", amount > 0);
        // return
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
            const bookingSlot = await checkbookingSlot(
                {
                    where: {
                        // date: payload?.date,
                        user_id: payload?.user_id,
                        is_complete: {
                            [Op.or]: [{ [Op.ne]: "cancelled" }, { [Op.eq]: null }]
                        }
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
                    raw: true,
                    nest: true,
                }
            )
            console.log(bookingSlot, "bookingSlot");
            console.log(bookingSlot?.date, "bookingSlot.date",date,"date",bookingSlot?.date != date);
            if (bookingSlot?.date != date){

                return handleErrorMessage(res, 400, "Please Add Money as per your Scheduled Appointment");
            }
                payload.type = "Daily"
        }
        // return
        const moneyAdd = await addMoney(payload)
        if (moneyAdd.stats) {
            return handleSuccessMessage(res, 200, "Money Added Successfully")
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