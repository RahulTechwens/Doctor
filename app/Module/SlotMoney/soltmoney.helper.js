exports.addDueMoney = (moneyJsonData) => {


    const datas = moneyJsonData

    const yyy = datas?.map(it => {

        const newItem = it;


        const slotMoney = newItem?.slot_moneys?.map((cit, index) => {
            let dueAMT = 0
            const newSItem = cit;
            const slotMoneyArray = newItem?.slot_moneys
            for (let i = index; i < slotMoneyArray.length; i++) {
                // console.log(slotMoneyArray[i]?.amount, "i", i, "index", index, dueAMT);
                dueAMT += Number(slotMoneyArray[i]?.amount)
            }
            // console.log("amount", dueAMT, "Number(cit.total_amount)", Number(cit.total_amount) - dueAMT);

            newSItem.dataValues.dueAmount = `${Number(cit.total_amount) - dueAMT}`;
            return { ...newSItem }

        });

        newItem.slot_moneys = slotMoney

        return newItem
    });
    // console.log(yyy[0].slot_moneys, 'yyy');

    return yyy;
}