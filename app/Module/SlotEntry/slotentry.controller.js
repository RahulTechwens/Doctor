const { handleSuccessMessage } = require("../../Utils/responseService");
const { create, list } = require("./slotentry.service");

exports.createSlotEntry = async(req, res, next) =>{
    try {
        const {name, limit, seat_available, date,start_time,end_time} = req.body

        const payloadOfSlotEntry = {
            name, limit, seat_available, date,start_time,end_time
        }

        const checkCreateSlot = create(payloadOfSlotEntry)
        if (checkCreateSlot) {
            return handleSuccessMessage(res, 200, "Slot created successfully")
        }

    } catch (error) {
        next(error);
    }
}

exports.getAllSlotEntry = async(req, res, next) =>{
    try {
        const slotentries = await list()
        return handleSuccessMessage(res, 200, "", slotentries)
    } catch (error) {
        next(error)
    }
}