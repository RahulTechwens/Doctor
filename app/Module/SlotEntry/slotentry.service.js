const { slot_entries } = require("../../../models/");

exports.create = async (payload) => {
    try {
        let payloadSata = [
            {
                "name":"Slot 2",
                "limit":6,
                "seat_available":6,
                "date": "2024-04-10T00:00:00Z",
                "start_time": "11:00:00",
                "end_time": "12:00:00"
            },
            {
                "name":"Slot 3",
                "limit":6,
                "seat_available":6,
                "date": "2024-04-10T00:00:00Z",
                "start_time": "12:00:00",
                "end_time": "13:00:00"
            },
            {
                "name":"Slot 4",
                "limit":6,
                "seat_available":6,
                "date": "2024-04-10T00:00:00Z",
                "start_time": "13:00:00",
                "end_time": "14:00:00"
            },
            {
                "name":"Slot 5",
                "limit":6,
                "seat_available":6,
                "date": "2024-04-10T00:00:00Z",
                "start_time": "14:00:00",
                "end_time": "15:00:00"
            },
            {
                "name":"Slot 6",
                "limit":6,
                "seat_available":6,
                "date": "2024-04-10T00:00:00Z",
                "start_time": "16:00:00",
                "end_time": "17:00:00"
            },
        ]
        let saveSlot = await slot_entries.bulkCreate(payloadSata);
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