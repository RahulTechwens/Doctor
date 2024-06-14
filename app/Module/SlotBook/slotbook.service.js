const { emit } = require("nodemon");
const {
  slot_book,
  slot_entries,
  User,
  UserProfile,
  Package,
  slot_money,
} = require("../../../models/");
const { patient } = require("../Report/report.controller");
const { where } = require("sequelize");
const { raw } = require("express");

// exports.book = async (payload) => {
//   try {
//     const bookslot = await slot_book.create(payload);
//     if (bookslot) {
//       const packageCount = await slot_book.findAll({
//         where: {
//           package_id: payload?.package_id,
//         },
//       });

//       if (packageCount.length == 6) {
//         await Package.update(
//           {
//             status: 1,
//           },
//           {
//             where: {
//               id: payload?.package_id,
//             },
//           }
//         );
//       }
//     }
//     // const packageCount =
//     return bookslot;
//   } catch (error) {
//     throw error;
//   }
// };


exports.book = async (payload) => {
  try {

    const packageCount = await slot_book.findAll({
      where: { user_id: payload.user_id },
      order: [
        ['createdAt', 'DESC']
      ],
    });

    let moneyCount = [];
    if (packageCount.length > 0) {
      moneyCount = await slot_money.findAll({
        where: { package_id: packageCount[0]?.package_id },
        order: [
          ['createdAt', 'DESC']
        ],
      });
    }

    
    let totalAmountByPackage = []
    if (moneyCount.length > 0) {

      totalAmountByPackage = moneyCount?.reduce((acc, cur) => acc + Number(cur?.amount), 0)
    }
    const lastbookbyPackage = packageCount?.filter(it => it?.package_id == packageCount[0].package_id)
    if (totalAmountByPackage < 5000 && lastbookbyPackage.length >= 5) {
      return false;
    }
    if (packageCount.length % 5 == 0) {
      payload.packageName_id = (packageCount.length / 5) + 1
    } else {
      payload.packageName_id = parseInt(packageCount.length / 5) + 1;
    }

    const countPackage = await Package.findOne({
      where: {
        id: payload.package_id,
        packageName: `Package ${Number(payload.packageName_id)}`,
        userId: payload.user_id,
      },
    });

    if (!countPackage) {
      const packageId = await Package.create({
        packageName: `Package ${Number(payload.packageName_id)}`,
        status: false,
        userId: payload.user_id,
      });
      if (packageId) {
        payload.package_id = packageId.id
      }
    }
    const bookslot = await slot_book.create(payload);
    return bookslot;
  } catch (error) {
    console.log(error);
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
  const checklotEmpty = await slot_book.findOne({
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

exports.reschedule = async (payload, old_date) => {
  const rescheduleSlot = await slot_book.update(payload, {
    where: {
      date: old_date,
    },
  });

  return rescheduleSlot;
};
exports.absent = async (user, date, store) => {
  try {
    const deleteData = await slot_book.delete({
      where: {
        user_id: user,
        date: date,
        store_id: store,
      },
    });
    return deleteData;
  } catch (error) {
    throw error;
  }
};

exports.present = async (user, date, store) => {
  try {
    const updateStatus = await slot_book.update(
      { is_complete: 1 },
      {
        where: {
          user_id: user,
          date: date,
          store_id: store,
        },
      }
    );
    return updateStatus;
  } catch (error) {
    throw error;
  }
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
      is_user_booking = 1;
      element["is_user_booking"] = 1;
    } else {
      element["is_user_booking"] = 0;
    }
    element["seat_available"] = allSlotEntry[0]["limit"] - countBook?.length;
  }

  // console.log(allSlotEntry);
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

exports.userWiseSlot = async (patientId) => {
  let is_user_booking = 0;

  const allSlotEntry = await slot_entries.findAll({
    raw: true,
    nest: true,
  });

  for (let index = 0; index < allSlotEntry.length; index++) {
    const element = allSlotEntry[index];

    let countBook = await slot_book.findAll({
      where: {
        store_id: element?.id,
        // date: date_string,
      },
    });

    let countWithDate =
      // await Package.findAll ({
      //   where:{
      //     userId: patientId,
      //   },
      //   include:[{
      //     model:slot_book,
      //     where:{
      //       store_id: element?.id,
      //       // date: date_string,
      //     }
      //   }]
      // })
      await slot_book.findAll({
        where: {
          store_id: element?.id,
          // date: date_string,
          user_id: patientId,
        },
        include: [
          {
            model: Package,
          },
        ],
        raw: true,
        nest: true,
      });
    if (countWithDate.length > 0) {
      is_user_booking = 1;
      element["is_user_booking"] = 1;
    } else {
      element["is_user_booking"] = 0;
    }
    element["seat_available"] = allSlotEntry[0]["limit"] - countBook?.length;
    element["slotBook"] = countWithDate;
  }

  const packages = await Package.findAll({
    where: {
      userId: patientId,
    },
    raw: true,
    nest: true,
  });

  // const bookingData = await Package.findAll({
  //   where: {
  //     userId: patientId,
  //   },
  //   include: [
  //     {
  //       model: slot_book,
  //       include: [
  //         {
  //           model: slot_entries,
  //         },
  //       ],
  //     },
  //   ],
  //   raw: true,
  //   nest: true,
  // });

  // await slot_book.findAll({
  //   where:{
  //     user_id:patientId
  //   },
  //   include: [
  //     {
  //       model: slot_entries,
  //     },
  //     {
  //       model: User,
  //       include: [
  //         {
  //           model: UserProfile,
  //         },
  //       ],
  //     },
  //   ],
  //   raw:true,
  //   nest:true // const bookingData = await Package.findAll({
  //   where: {
  //     userId: patientId,
  //   },
  //   include: [
  //     {
  //       model: slot_book,
  //       include: [
  //         {
  //           model: slot_entries,
  //         },
  //       ],
  //     },
  //   ],
  //   raw: true,
  //   nest: true,
  // });
  // })

  const result = packages.map((pkg) => {
    const packageSlots = allSlotEntry
      .map((slot) => {
        const slotBook = slot.slotBook.filter((book) => book.package_id === pkg.id);
        if (slotBook.length > 0) {
          const { date: slot_date, time: slot_time } = slotBook[0];
          return { ...slot, slotBook: undefined, slot_date, slot_time };
        }
        return null;
      })
      .filter((slot) => slot !== null);

    return {
      packageName: pkg.packageName,
      status: pkg.status,
      patientWiseBookedData: packageSlots,
    };
  });



  // console.log(JSON.stringify(result, null, 2));
  return result;
};
