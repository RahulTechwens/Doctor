const express = require("express");
const port = 5001;
const app = express();

const { pageNotFound } = require("./app/Middleware/pageNotFoundMiddleware");
const { errorHandler } = require("./app/Middleware/errorMiddleware");
const userRoute = require("./app/Module/User/user.route");
const slotentryRoute = require("./app/Module/SlotEntry/slotentry.route");
const slotBookRoute = require("./app/Module/SlotBook/slotbook.route");
const slotMoneyRoute = require("./app/Module/SlotMoney/slotmoney.route");
const slotReport = require("./app/Module/Report/report.route");

app.use(
  express.json({
    limit: "110mb",
    extended: true,
  })
);

app.get("/", (req, res) =>{
  res.send("hello world")
})
app.use("/api/user", userRoute);
app.use("/api/slot", slotentryRoute);
app.use("/api/slot/book", slotBookRoute);
app.use("/api/", slotMoneyRoute);
app.use("/api/", slotReport);
app.use(pageNotFound)
app.use(errorHandler)




app.listen(port, () => {
  console.log(`App is running at port ${port}`);
});
