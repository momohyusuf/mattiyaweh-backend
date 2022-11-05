// this package is required in other for us to be able to access the environmental variables
require("dotenv").config();
// +++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++
// this package is required to make writing async logic easier inside our controllers
require("express-async-errors");
// ++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++
// default express function to create our server
const express = require("express");
const app = express();
// ++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++

// connect to mongo database function
const connectToDataBase = require("./database-connection/connect");
// more imports here
// this is to enable cross origin resource sharing
const cors = require("cors");
// ============================
// this is to enable us access the cookies on the server for validation
const cookieParser = require("cookie-parser");
// ============================
// this is for debugging purpose to see the route being requested in the terminal
const morgan = require("morgan");
// ============================
// for file uploading
const fileUpload = require("express-fileupload");
// ===========================
const rateLimit = require("express-rate-limit");
// images storage database
const cloudinary = require("cloudinary").v2;
// coludinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ============================
// +++++++++++++
// Routes imports
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
// +++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++
// general middle wares to handle sever errors
const routeNotFound = require("./middleware/routeNotFound");
const serverErrorHandler = require("./middleware/serverErrorHandler");
// ++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++
// middleware
// enables us to access req.body values
app.use(express.json());
// ++++++++++++++++++++++++++
///////////////////////////////////
// const whitelist = ["hhttps://mattiyaweh-demo.netlify.app/"];
const corsOptions = {
  credentials: true, // This is important.
};
// ////////////////////////////////////

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

app.use(cors(corsOptions));
app.use(cookieParser(process.env.JWT_SECRET));
// app.use(morgan("tiny"));
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/image", uploadRoutes);
app.get("/", (req, res) => res.send("Hello World!"));

// general middleware
app.use(routeNotFound);
app.use(serverErrorHandler);

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDataBase(process.env.CONNECT_URI);
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
