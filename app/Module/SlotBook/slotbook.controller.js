const { handleErrorMessage, handleSuccessMessage } = require("../../Utils/responseService")
const { checkbookingStatus, checkSlotEmpty, slotEntries, book, reschedule, entry, edit, userWiseSlot } = require("./slotbook.service")



exports.bookSlot = async (req, res, next) =>{
    try {
        const { store, date, time, user, type } =  req.body

        const payloadOfSlotBook = {
            store_id:store, date, time, user_id:user, type
        }
        const checkSlot = await checkSlotEmpty(payloadOfSlotBook?.date, payloadOfSlotBook?.store_id);
        const checkSlotEntry = await slotEntries(payloadOfSlotBook?.store_id);
        if (type == "entry") {
            delete payloadOfSlotBook.type
            const isCheckBookingStatus = await checkbookingStatus(payloadOfSlotBook.date, payloadOfSlotBook.user_id)
            if (isCheckBookingStatus) {
                return handleErrorMessage(res, 400, "Slot is already booked for the User.")
            }
           

            if (checkSlot.length < checkSlotEntry?.limit) {
                const checkEntry = await book(payloadOfSlotBook)
                if (checkEntry) {
                    return handleSuccessMessage(res, 200, "Slot Booked Successful")
                }
            }else{
                return handleErrorMessage(res, 400, "Slots are full.");
            }
        }else{
            delete payloadOfSlotBook.type
            if (checkSlot.length < checkSlotEntry?.limit.length) {
                const isReschedule = await reschedule(checkSlotEntry, payloadOfSlotBook)

                if (isReschedule) {
                    return handleSuccessMessage(res, 200, "Slot rescheduled Successful")
                }

            }
        }
    } catch (error) {
        next(error)
    }
}

exports.getBookSlot = async(req, res, next) =>{
    try {
        let date_string = req?.query?.date;
        let user_id = req?.query?.user_id;
        let mode = req?.query?.mode;
        if (date_string && user_id) {      
            if (mode == "entry") {
                const getEntryForSLot = await entry(date_string, user_id, mode)
    
                return res.status(200).json({
                    'status': 200,
                    'success': true,
                    'is_user_booked':getEntryForSLot.is_user_booked,
                    "user_wise_slot_register":getEntryForSLot?.user_wise_slot_register
                })
            }else{
                const getEntryForSLotEdit = await edit(date_string, user_id, mode)
    
                return res.status(200).json({
                    'status': 200,
                    'success': true,
                    'user_wise_slot_booked': getEntryForSLotEdit
                })
            }
        }else{
            return res.status(400).json({
                'status': 400,
                'success': true,
                'user_wise_slot_booked': "Wrong Params"
            })
        }

    } catch (error) {
        next(error)
    }
}

exports.getUserWiseSlotBooked = async(req, res, next) =>{
    try {
        let extractArr = [];
        const patientId = req?.query?.patientId;
        const userWiseSlotBooking = await  userWiseSlot(patientId);

        for (let index = 0; index < userWiseSlotBooking.length; index++) {
            const userWiseSlotBookingelement = userWiseSlotBooking[index];
            extractArr.push(
              {
                date:userWiseSlotBookingelement.date,
                slot_id:userWiseSlotBookingelement?.slot_entry?.name,
                time:userWiseSlotBookingelement?.slot_entry?.start_time,
                full_name:userWiseSlotBookingelement?.User?.UserProfiles?.full_name,
                phone:userWiseSlotBookingelement?.User?.phone
              }
            )
          }

        return res.status(200).json({
            'status': 200,
            'success': true,
            'data': extractArr
        })
    } catch (error) {
        next(error)
    }
}

