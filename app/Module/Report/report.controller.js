const { transactionReport } = require("./report.service");

exports.transaction = async (req, res, next) => {
  try {
    const from_date_str = req?.query?.from_date;
    const to_date_str = req?.query?.to_date;
    const filter = req?.query?.filter;

    const reportTrans = await  transactionReport(from_date_str, to_date_str, filter);
    if (reportTrans) {
      return res.status(200).json({
        status: 200,
        success: true,
        data: reportTrans,
      });
    }
  } catch (error) {
    next(error);
  }
};
