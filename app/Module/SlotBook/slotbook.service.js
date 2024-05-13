const { slot_book, slot_entries, User, UserProfile } = require("../../../models/");
const { patient } = require("../Report/report.controller");

exports.book = async (payload) => {
  try {
    const bookslot = await slot_book.create(payload);
    return bookslot;
  } catch (error) {
    throw error;
  }
};

exports.checkbookingStatus = async (date, user) => {
  const checkBooked = await slot_book.findOne({
    where: {
      date: date,
      user_id: user,
    },
    raw: true,
    nest: true,
  });

  return checkBooked;
};

exports.checkSlotEmpty = async (date, slot) => {
  const checklotEmpty = await slot_book.findAll({
    where: {
      date: date,
      store_id: slot,
    },
    raw: true,
    nest: true,
  });

  return checklotEmpty;
};

exports.slotEntries = async (slot) => {
  const slotEntryLimit = await slot_entries.findOne({
    where: {
      id: slot,
    },
    raw: true,
    nest: true,
  });

  return slotEntryLimit;
};

exports.reschedule = async (payload) => {
  const rescheduleSlot = await slot_book.update(payload, {
    where: {
      date: payload?.date,
    },
  });

  return rescheduleSlot;
};

// exports.getAllSLotEntry = async () => {
//   const allSlotEntry = await slot_entries.findAll({
//     raw: true,
//     nest: true,
//   });

//   return allSlotEntry;
// };

exports.entry = async (date_string, user_id, mode) => {
  let is_user_booking = 0;

  const allSlotEntry = await slot_entries.findAll({
    raw: true,
    nest: true,
  });

  for (let index = 0; index < allSlotEntry.length; index++) {
    const element = allSlotEntry[index];
    console.log(element);

    let countBook = await slot_book.findAll({
      where: {
        store_id: element?.id,
        date: date_string,
      },
    });

    let countWithDate = await slot_book.findAll({
      where: {
        store_id: element?.id,
        date: date_string,
        user_id: user_id,
      },
      raw: true,
      nest: true,
    });
    if (countWithDate.length > 0) {
      console.log("hello");
      is_user_booking = 1;
      element["is_user_booking"] = 1;
    } else {
      element["is_user_booking"] = 0;
    }
    element["seat_available"] = allSlotEntry[0]["limit"] - countBook?.length;
  }

  console.log(allSlotEntry);
  return {
    is_user_booked: is_user_booking,
    user_wise_slot_register: allSlotEntry,
  };
};

exports.edit = async (date_string, user_id, mode) => {
  let is_user_booking = 0;
  let slots = [];
  const allSlotEntry = await slot_entries.findAll({
    raw: true,
    nest: true,
  });
  let slot_data_date = await slot_book.findAll({
    where: {
      user_id: user_id,
      date: date_string,
    },
    raw: true,
    nest: true,
  });
  if (slot_data_date.length > 0) {
    for (let index = 0; index < allSlotEntry.length; index++) {
      const element = allSlotEntry[index];
      let countBook = await slot_book.findAll({
        where: {
          store_id: element?.id,
          date: date_string,
        },
      });

      let countWithDate = await slot_book.findAll({
        where: {
          store_id: element?.id,
          date: date_string,
          user_id: user_id,
        },
        raw: true,
        nest: true,
      });
      slots.push({
        id: element?.id,
        name: element?.name,
        date: element?.date,
        start_time: element?.start_time,
        end_time: element?.end_time,
        limit: element?.limit,
        seat_available: element?.limit - countBook.length,
        is_user_booking: countWithDate.length > 0 ? 1 : 0,
      });
    }
  }

  return slots;
};

exports.userWiseSlot = async(patientId) =>{
  const bookingData = await slot_book.findAll({
    where:{
      user_id:patientId
    },
    include: [
      {
        model: User,
        include: [
          {
            model: UserProfile,
          },
        ],
      },
    ],
    raw:true,
    nest:true
  })

  return bookingData;


}
