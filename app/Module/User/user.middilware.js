const { handleErrorMessage } = require("../../Utils/responseService");
const { isExsistUser, packageFound, getBookSlots, getBookSlotMoney } = require("./user.service");

exports.completeValidateResult = async (req, res, next) => {
    const { id, type, address, full_name } = req.body;
    const userData = await isExsistUser(id)
    console.log(userData, "userData");
    // return
    if (!userData) {
        return handleErrorMessage(res, 404, "User not found")
    }
    const getPackage = await packageFound({ id: id, type: userData?.type });
    // if (userData.type.includes('daily')) {
    console.log(getPackage, "getPackage");
    if (getPackage) {
        const bookSlots = await getBookSlots({ id: id, package_id: getPackage?.id });
        console.log(bookSlots, "bookSlots");
        let moneyCount;

        if (bookSlots.length > 0) {
            if (userData.type.includes('daily')) {

                moneyCount = await getBookSlotMoney({
                    user_id: id,
                    package_id: getPackage?.id,
                    date: bookSlots?.[0]?.date
                });


                let lastPackageAmount = 0
                const bookIsCompletebyPackage = bookSlots?.[0]?.is_complete

                if (moneyCount) {
                    lastPackageAmount = moneyCount?.reduce((total, item) => total + (Number(item?.amount) || 0), 0);
                }
                console.log(lastPackageAmount, "lastPackageAmount");
                if ((lastPackageAmount < 500 || (bookIsCompletebyPackage != 'complete' && bookIsCompletebyPackage != 'cancelled'))) {
                    return handleErrorMessage(res, 400, " Make the previous payment first or complete");
                } else {
                    console.log("else Daily");
                    // return
                    return next();
                }
            } else if (userData.type.includes('package')) {

                moneyCount = await getBookSlotMoney({
                    user_id: id,
                    package_id: getPackage?.id,
                });

                let totalAmountByPackage = 0
                if (moneyCount.length > 0) {

                    totalAmountByPackage = moneyCount?.reduce((acc, cur) => acc + Number(cur?.amount), 0)
                }
                const lastbookbyPackage = bookSlots?.filter(it => it?.package_id == getPackage?.id)
                const bookIsCompletebyPackage = bookSlots?.filter(it => (it?.package_id == getPackage?.id && it?.is_complete == "complete"))

                console.log(bookIsCompletebyPackage.length, "bookIsCompletebyPackage", lastbookbyPackage.length, "lastbookbyPackage.length ", totalAmountByPackage);
                console.log((totalAmountByPackage < 5000 && lastbookbyPackage.length <= 6), (lastbookbyPackage.length <= 6 && bookIsCompletebyPackage.length < 6), (totalAmountByPackage < 5000 && lastbookbyPackage.length >= 5) || (lastbookbyPackage.length >= 5 && bookIsCompletebyPackage.length < 5));

                if ((totalAmountByPackage < 5000 && lastbookbyPackage.length <= 6) || (lastbookbyPackage.length <= 6 && bookIsCompletebyPackage.length < 6)) {
                    console.log("if");
                    return handleErrorMessage(res, 400, " Make the previous payment first or complete");
                } else {
                    console.log("1st else");
                    // return
                    return next();
                }

            } else {
                return handleErrorMessage(res, 400, " User type is invalied");
            }
            console.log(moneyCount, "moneyCount");
        }
        console.log("2nd else");
        return next();
    } else {
        return handleErrorMessage(res, 404, " Package is not found");
    }

    // } else if (userData.type.includes('package')) {
    //     console.log(getPackage, "getpackage");
    // }
    return
    return next();
};