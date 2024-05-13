const { transactionReport, patientBookngReport } = require("./report.service");

exports.transaction = async (req, res, next) => {
  try {
    const from_date_str = req?.query?.from_date;
    const to_date_str = req?.query?.to_date;
    const filter = req?.query?.filter;
    let extractArr = []
    const reportTrans = await  transactionReport(from_date_str, to_date_str, filter);
    if (reportTrans) {

      for (let index = 0; index < reportTrans.length; index++) {
        const reportTransElement = reportTrans[index];
        extractArr.push(
          {
            amount:reportTransElement?.amount,
            total_amount:reportTransElement?.total_amount,
            full_name:reportTransElement?.User?.UserProfiles?.full_name,
            address:reportTransElement?.User?.UserProfiles?.address,
            phone:reportTransElement?.User?.phone,
            email:reportTransElement?.User?.email,
            date:reportTransElement?.date,
            time:reportTransElement?.time
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

exports.patient = async (req, res, next) =>{
  try {
    const from_date_str = req?.query?.from_date;
    const to_date_str = req?.query?.to_date;
    const filter = req?.query?.filter;
    const reportPatientBookng = await  patientBookngReport(from_date_str, to_date_str, filter);

    return res.status(200).json({
      status: 200,
      success: true,
      data: reportPatientBookng,
    });
  } catch (error) {
    next(error);
  }
}
