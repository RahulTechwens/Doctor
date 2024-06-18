const { transactionReport, patientBookngReport, userInfoBySlotBooked } = require("./report.service");

exports.transaction = async (req, res, next) => {
  try {
    const from_date_str = req?.query?.from_date;
    const to_date_str = req?.query?.to_date;
    const filter = req?.query?.filter;
    const offset = req?.query?.offset;
    const limit = req?.query?.limit;
    const userId = req?.query?.userId
    let extractArr = []
    const reportTrans = await transactionReport(from_date_str, to_date_str, filter, offset, limit, userId);
    if (reportTrans) {
      for (let index = 0; index < reportTrans.rows.length; index++) {
        const reportTransElement = reportTrans.rows[index];
        extractArr.push(
          {
            id: reportTransElement?.id,
            amount: reportTransElement?.amount,
            total_amount: reportTransElement?.total_amount,
            full_name: reportTransElement?.User?.UserProfiles?.full_name,
            address: reportTransElement?.User?.UserProfiles?.address,
            phone: reportTransElement?.User?.phone,
            email: reportTransElement?.User?.email,
            date: reportTransElement?.date,
            time: reportTransElement?.time,
            packageName: reportTransElement?.Package?.packageName
          }
        )
      }

      return res.status(200).json({
        status: 200,
        success: true,
        data: extractArr,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.patient = async (req, res, next) => {
  try {
    const from_date_str = req?.query?.from_date;
    const to_date_str = req?.query?.to_date;
    const filter = req?.query?.filter;
    const offset = req?.query?.offset;
    const limit = req?.query?.limit;
    let extractArr = []
    const reportPatientBookng = await patientBookngReport(from_date_str, to_date_str, filter, offset, limit);


    for (let index = 0; index < reportPatientBookng.length; index++) {
      const reportPatientelement = reportPatientBookng[index];
      extractArr.push(
        {
          id: reportPatientelement?.id,
          date: reportPatientelement.date,
          slot_id: reportPatientelement?.slot_entry?.name,
          time: reportPatientelement?.slot_entry?.start_time,
          full_name: reportPatientelement?.User?.UserProfiles?.full_name,
          phone: reportPatientelement?.User?.phone,
          status: reportPatientelement?.is_complete
        }
      )
    }

    return res.status(200).json({
      status: 200,
      success: true,
      data: extractArr,
    });
  } catch (error) {
    next(error);
  }
}

exports.patientInfoWhoIsBooked = async (req, res, next) => {
  try {
    const offset = req?.query?.offset;
    const limit = req?.query?.limit;
    const userId = req?.query?.userId
    const userInfo = await userInfoBySlotBooked(offset, limit, userId);

    return res.status(200).json({
      status: 200,
      success: true,
      data: userInfo,
    });
  } catch (error) {
    console.log(error);
    next(error)
  }
}