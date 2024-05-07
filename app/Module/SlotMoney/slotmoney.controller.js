const { handleSuccessMessage } = require("../../Utils/responseService")
const { addMoney, getMoney } = require("./slotmoney.service")

exports.addSlotMoney = async(req, res, next) =>{
    try {
        const {date, time, amount, user} = req?.body
        const payload = {
            date, time, amount, user_id:user
        }

        const moneyAdd = await addMoney(payload)
        if (moneyAdd.stats) {
            return res.status(200).json({
                'status': 200, 
                'success': true, 
                'message': 'Money Added Successful',
                'data': moneyAdd.summation
            })
        }else{
            return res.status(200).json({
                'status': 200, 
                'success': true, 
                'message': 'Paid amount cannot be greater than Total amount'
            })
        }
    } catch (error) {
        next(error)
    }
}

exports.getSlotMoney = async (req, res, next)=>{
    try {
        const user_id = req?.query?.user_id;
        const getMoneyUserId = await getMoney(user_id)
        if (getMoneyUserId) {
            return res.status(200).json({
                'status': 200, 
                'success': true,
                'data':getMoneyUserId
            })
        }
    } catch (error) {
        next(error)
    }
}