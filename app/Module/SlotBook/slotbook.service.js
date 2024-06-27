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
const { where, Op } = require("sequelize");
const { raw } = require("express");
const { packageFound } = require("../User/user.service");

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
    let whereCond = {
      user_id: payload.user_id,
      is_complete: {
        [Op.or]: [{ [Op.ne]: "cancelled" }, { [Op.eq]: null }]
      }
    }
    const getPackage = await packageFound({ id: payload.user_id, type: "Daily" });
    // if (userData.type.includes('daily')) {
    console.log(getPackage, "getPackage");
    if (getPackage) {
      whereCond = { ...whereCond, package_id: { [Op.ne]: getPackage?.id } }
    }
    const packageCount = await slot_book.findAll({
      where: whereCond,
      order: [
        ['createdAt', 'DESC']
      ],
    });
    // console.log(packageCount, "packageCount", { [Op.ne]: 'cancelled' });
    // return packageCount
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
    const lastbookbyPackage = packageCount?.filter(it => it?.package_id == packageCount[0]?.package_id)
    const bookIsCompletebyPackage = packageCount?.filter(it => (it?.package_id == packageCount[0]?.package_id && it?.is_complete == "complete"))

    console.log(bookIsCompletebyPackage.length, "bookIsCompletebyPackage", lastbookbyPackage.length, "lastbookbyPackage.length ", totalAmountByPackage);
    console.log((totalAmountByPackage < 5000 && lastbookbyPackage.length >= 6), (lastbookbyPackage.length >= 6 && bookIsCompletebyPackage.length < 6), (totalAmountByPackage < 5000 && lastbookbyPackage.length >= 5) || (lastbookbyPackage.length >= 5 && bookIsCompletebyPackage.length < 5));

    if ((totalAmountByPackage < 5000 && lastbookbyPackage.length >= 6) || (lastbookbyPackage.length >= 6 && bookIsCompletebyPackage.length < 6)) {
      return false;

    }

    console.log("else");
    // return
    if (packageCount.length % 6 == 0) {
      console.log("if", packageCount.length / 6);

      payload.packageName_id = (packageCount.length / 6) + 1
    } else {
      console.log("else", parseInt(packageCount.length / 6));

      payload.packageName_id = parseInt(packageCount.length / 6) + 1;
    }
    console.log(payload, "payload", packageCount[0]?.package_id);

    const countPackage = await Package.findOne({
      where: {
        id: packageCount[0]?.package_id || payload.package_id,
        packageName: `Package ${Number(payload.packageName_id)}`,
        userId: payload.user_id,
      },
    });
    console.log(countPackage, "countPackage");


    if (!countPackage) {
      const packageId = await Package.create({
        packageName: `Package ${Number(payload.packageName_id)}`,
        status: true,
        userId: payload.user_id,
      });
      if (packageId) {
        payload.package_id = packageId.id
      }
    } else {
      payload.package_id = countPackage?.id
    }
    console.log(payload, "payload");
    payload.is_complete = 'pending'
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
      is_complete: {
        [Op.or]: [{ [Op.ne]: "cancelled" }, { [Op.eq]: null }]
      }
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
      is_complete: {
        [Op.or]: [{ [Op.ne]: "cancelled" }, { [Op.eq]: null }]
      }
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
  payload.is_complete = 'rescheduled';
  console.log(payload, "payload");
  // return
  const searchSlotByUser = await slot_book.findAll({
    where: {
      date: old_date,
      user_id: payload?.user_id
    }
  })
  console.log(searchSlotByUser, "searchSlotByUser", old_date, payload?.user_id);
  // return

  if (!searchSlotByUser) {
    console.log("if");
    return false;
  }
  for (let i = 0; i < searchSlotByUser.length; i++) {
    console.log(i, "in", searchSlotByUser.length);

    if (searchSlotByUser[i]?.is_complete == "cancelled" || searchSlotByUser[i]?.is_complete == "complete") {
      console.log(i, "if");
      continue;
    } else {
      console.log(i, "else");

      console.log(searchSlotByUser[i], "searchSlotByUser[i]");
      // return
      const rescheduleSlot = await slot_book.update(payload, {
        where: {
          date: old_date,
          user_id:payload?.user_id,
          package_id:payload?.package_id,
          [Op.and]: [
            { is_complete: { [Op.ne]: "cancelled" } },
            { is_complete: { [Op.ne]: "complete" } },
            // { is_complete: { [Op.eq]: null } },
          ]
        },
      });
      console.log(rescheduleSlot, "rescheduleSlot", rescheduleSlot[0]);
      // return
      if (!rescheduleSlot[0] == 0) {
        return true;
      }
      return false;
    }
  }
  // return 

};
exports.absent = async (user, date, store) => {
  try {
    const absentData = await slot_book.update(
      { is_complete: 'cancelled' },
      {
        where: {
          user_id: user,
          date: date,
          store_id: store,
        },
      });
    return absentData;
  } catch (error) {
    throw error;
  }
};

exports.present = async (user, date, store) => {
  try {
    const updateStatus = await slot_book.update(
      { is_complete: "complete" },
      {
        where: {
          user_id: user,
          date: date,
          store_id: store,
        },
      }
    );
    if (updateStatus[0] !== 0) {
      return true;
    }
    return false;
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
        is_complete: { [Op.ne]: "cancelled" }
      },
    });

    let countWithDate = await slot_book.findAll({
      where: {
        store_id: element?.id,
        date: date_string,
        user_id: user_id,
        is_complete: { [Op.ne]: "cancelled" }
      },
      raw: true,
      nest: true,
    });
    if (countWithDate.length > 0) {
      is_user_booking = 1;
      element["is_user_booking"] = 1;
      element["slot_book_date"] = countWithDate?.[0]?.date;

    } else {
      element["is_user_booking"] = 0;
    }
    element["seat_available"] = allSlotEntry[0]["limit"] - countBook?.length;


    // newly added code
    console.log(allSlotEntry[0]["limit"] - countBook?.length,"zzzzzzzz");
    if (allSlotEntry[0]["limit"] - countBook?.length == 0) {
      element['slot_avaliability'] = 1
    } else {
      element['slot_avaliability'] = 0
    }
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
  // if (slot_data_date.length > 0) {
  for (let index = 0; index < allSlotEntry.length; index++) {
    const element = allSlotEntry[index];
    let countBook = await slot_book.findAll({
      where: {
        store_id: element?.id,
        date: date_string,
        is_complete: { [Op.ne]: "cancelled" }

      },
    });

    let countWithDate = await slot_book.findAll({
      where: {
        store_id: element?.id,
        date: date_string,
        user_id: user_id,
        is_complete: { [Op.ne]: "cancelled" }

      },
      raw: true,
      nest: true,
    });

    console.log(countBook.length, "ll");
    if (allSlotEntry[0]["limit"] - countBook?.length == 0) {
      element['slot_avaliability'] = 1
    } else {
      element['slot_avaliability'] = 0
    }

    slots.push({
      id: element?.id,
      name: element?.name,
      date: element?.date,
      start_time: element?.start_time,
      end_time: element?.end_time,
      limit: element?.limit,
      seat_available: element?.limit - countBook.length,
      is_user_booking: countWithDate.length > 0 ? 1 : 0,
      slot_avaliability: element?.slot_avaliability
    });
  }
  // }

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
        is_complete: { [Op.ne]: "cancelled" }
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
          is_complete: { [Op.ne]: "cancelled" },
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

    // console.log(countWithDate,"countWithDate");
    // return
    if (countWithDate.length > 0) {
      is_user_booking = 1;
      element["is_user_booking"] = 1;
    } else {
      element["is_user_booking"] = 0;
    }
    element["seat_available"] = allSlotEntry[0]["limit"] - countBook?.length;
    element["slotBook"] = countWithDate;
  }

  // return
  const packages = await Package.findAll({
    where: {
      userId: patientId,
    },
    order: [
      ['createdAt', 'DESC']
    ],
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
  // console.log(allSlotEntry[0].slotBook[0],"allSlotEntry");

  const result = packages.map((pkg) => {
    const packageSlots = allSlotEntry
      .map((slot) => {


        let slotBook = []
        slot.slotBook.map((book) => {
          if (book.package_id === pkg.id) {
            slotBook.push({
              date: book?.date,
              store_id: book?.store_id,
              is_complete: book?.is_complete,
            })
          }
        });
        if (slotBook.length > 0) {
          return {
            ...slot,
            slotBook,
          };
        }
        return null;
      })
      .filter((slot) => slot !== null);

    // console.log(packageSlots,"packageSlots");
    return {
      packageName: pkg.packageName,
      status: pkg.status,
      patientWiseBookedData: packageSlots,
    };
  });



  // console.log(JSON.stringify(result, null, 2));
  return result.filter((slot) => slot?.patientWiseBookedData?.length > 0);
};

exports.getPackageById = async (Id, user) => {
  const packageById = await Package.findOne({
    where: {
      id: Id,
      userId: user
    },
    include: [
      {
        model: User
      }
    ],
    raw: true,
    nest: true
  })
  return packageById
}

exports.dailyBook = async (payload) => {
  console.log(payload, "payload");
  const packageCount = await slot_book.findAll({
    where: {
      user_id: payload?.user_id,
      package_id: payload?.package_id
      // is_complete: {
      //   [Op.or]: [{ [Op.ne]: "cancelled" }, { [Op.eq]: null }]
      // }
    },
    order: [
      ['createdAt', 'DESC']
    ],
  });
  // console.log(packageCount, packageCount);
  let moneyCount;
  payload.packageName_id = 1
  let bookbyPackageCountExcludeCancel = packageCount?.filter(it => it.is_complete != 'cancelled');
  if (packageCount.length > 0 && bookbyPackageCountExcludeCancel.length > 0) {
    // const bookbyPackageCountExcludeCancel = packageCount?.filter(it => it?.dataValues?.is_complete != "cancelled");
    console.log(packageCount, "bookbyPackageCountExcludeCancel");
    moneyCount = await slot_money.findAll({
      where: {
        package_id: bookbyPackageCountExcludeCancel[0]?.package_id,
        date: bookbyPackageCountExcludeCancel[0]?.date
      },
      order: [
        ['createdAt', 'DESC']
      ],
    });
    let lastPackageAmount = 0
    if (moneyCount) {
      // lastPackageAmount = moneyCount?.amount
      lastPackageAmount = moneyCount?.reduce((total, item) => total + (Number(item?.amount) || 0), 0);

    }

    const bookIsCompletebyPackage = packageCount?.[0]?.is_complete

    // console.log(bookIsCompletebyPackage, "bookIsCompletebyPackage", lastPackageAmount);
    console.log(lastPackageAmount < 500, (bookIsCompletebyPackage != 'complete' && bookIsCompletebyPackage != 'cancelled'));

    if ((lastPackageAmount < 500 || (bookIsCompletebyPackage != 'complete' && bookIsCompletebyPackage != 'cancelled'))) {

      return false;
    }
    // payload.packageName_id = bookbyPackageCountExcludeCancel.length + 1
  }

  // console.log(packageCount[0]?.package_id, payload.package_id, packageCount.length, payload.packageName_id);
  // return



  const countPackage = await Package.findOne({
    where: {
      id: packageCount?.[0]?.package_id || payload.package_id,
      packageName: `Daily`,
      userId: payload.user_id,
    },
  });
  // console.log(countPackage, "countPackage");

  if (!countPackage) {
    const packageId = await Package.create({
      packageName: `Daily`,
      status: false,
      userId: payload.user_id,
    });
    if (packageId) {
      payload.package_id = packageId.id
    }
  } else {
    payload.package_id = countPackage?.id
  }
  console.log(payload, "payload");
  payload.is_complete = 'pending'
  const bookslot = await slot_book.create(payload);
  return bookslot;
}

exports.checkbookingSlot = async (payload) => {
  const checkBooked = await slot_book.findOne(payload);

  return checkBooked;
};