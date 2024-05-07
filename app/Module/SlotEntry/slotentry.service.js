const { slot_entries } = require("../../../models/");

exports.create = async (payload) => {
    try {
        let saveSlot = await slot_entries.create(payload);
        if (saveSlot){
            return true
        }
        return false
    } catch (error) {
        throw error
    }
};

exports.list = async () =>{
    try {
        let slotentryList = await slot_entries.findAll({
            raw:true,
            nest:true
        })

        return slotentryList;
    } catch (error) {
        throw error
    }
}