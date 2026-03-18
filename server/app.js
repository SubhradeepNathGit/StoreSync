require("dotenv").config();
const express = require("express");
const app = express();

const connectDB = require("./app/config/db");
const setupMiddleware = require("./app/middleware");
const routes = require("./app/routes");
const adminRoutes = require('./app/routes/adminRoutes');
const errorHandler = require("./app/middleware/error");


connectDB();
setupMiddleware(app);


app.use("/", routes);


app.use("/api/admin", adminRoutes);


app.use(errorHandler);


const PORT = process.env.PORT || 3006;
const server = app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});


server.timeout = 600000;
