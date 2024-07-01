
const { Op } = require("sequelize")
const { handleSuccessMessage, handleErrorMessage } = require("../../Utils/responseService")
const { checkbookingSlot } = require("../SlotBook/slotbook.service")
const { addMoney, getMoney, getPackage, getUser } = require("./slotmoney.service")
const { isExsistUser, packageList } = require("../User/user.service");
const envConfig = require("../../Utils/envConfig");

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
            console.log(bookingSlot?.date, "bookingSlot.date", date, "date", bookingSlot?.date != date);
            if (bookingSlot?.date != date) {

                return handleErrorMessage(res, 400, "Please Add Money as per your Scheduled Appointment");
            }
            payload.type = "Daily"
        }
        // return
        const moneyAdd = await addMoney(payload)
        if (moneyAdd.status) {
            return handleSuccessMessage(res, 200, "Money Added Successfully")
        } else {
            return handleErrorMessage(res, 400, "Paid Amount exceeds the package limit of 5000", { 'dueblance': moneyAdd?.dueBlance });

            // return res.status(200).json({
            //     'status': 200,
            //     'success': true,
            //     'message': 'Paid amount cannot be greater than Total amount',
            //     'dueblance': moneyAdd?.dueBlance
            // })
        }
    } catch (error) {
        next(error)
    }
}

exports.getSlotMoney = async (req, res, next) => {
    try {
        const user_id = req?.query?.user_id;
        const chkUser = await isExsistUser(user_id);
        if (!chkUser) {
            return handleErrorMessage(res, 404, "User not found")
        }
        // console.log(envConfig);
        // return
        const getMoneyUserId = await getMoney(user_id, chkUser?.type);
        // console.log(getMoneyUserId, "getMoneyUserId", getMoneyUserId.length, "getMoneyUserId?.length < 0", getMoneyUserId?.length < 0);

        if (getMoneyUserId?.length > 0) {
            return res.status(200).json({
                'status': 200,
                'success': true,
                'data': [getMoneyUserId?.[0]]
            })
        } 
        // else {
        //     // const bookingList = await packageList(user_id, chkUser?.type);
        //     // console.log(bookingList?.[0]?.slot_books?.length > 0, bookingList?.[0]?.slot_books?.[0]?.is_complete != "cancelled", (bookingList?.[0]?.slot_books?.length > 0 && bookingList?.[0]?.slot_books?.is_complete != "cancelled"));

        //     return res.status(200).json({
        //         'status': 200,
        //         'success': true,
        //         'data': [{
        //             id: 0,
        //             packageName: "",
        //             status: true,
        //             slot_moneys: [{
        //                 dueAmount:
        //                     // (bookingList?.[0]?.slot_books?.length > 0 && bookingList?.[0]?.slot_books?.[0]?.is_complete != "cancelled") ?
        //                     chkUser?.type.includes("daily") ? envConfig.DAILY_AMOUNT : envConfig.PACKAGE_AMOUNT

        //             }]
        //         }]
        //         // "data": bookingList
        //     })
        // }
    } catch (error) {
        console.log(error);
        next(error)
    }
}