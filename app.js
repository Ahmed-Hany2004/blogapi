const express = require("express");
const morgan = require("morgan");
const { main } = require("./connection");
const bodyparser = require("body-parser");
var cors = require('cors')

const app = express();

app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.use(cors())


const userpath = require("./routes/userRoute");
const blogpath = require("./routes/blogRoute")


app.use("/user",userpath)
app.use("/blog",blogpath)

main(app);