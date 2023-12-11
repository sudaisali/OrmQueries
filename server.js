require('dotenv').config()
const express = require('express')
const { sequelize } = require('./src/config/database')
const {Employee} = require('./src/models/employee')
const {Office} = require('./src/models/office')
const {ProductLine} = require('./src/models/productLines')
const {Product} = require('./src/models/product')
const {Customer} = require('./src/models/customer')
const {Order} = require('./src/models/order')
const {OrderDetails} = require('./src/models/orderDetail')
const {Payment} = require('./src/models/payment')
const {router} = require('./src/router/products')
const {rateLimit} = require('express-rate-limit')
const morgan = require('morgan')
const {logger} = require('./src/config/logging')
const {Log} = require('./src/models/Logs')

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.
})


const app = express()
app.use(express.json())

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
// app.use(async (req, res, next) => {
//     try {
//       const logEntry = {
//         method: req.method,
//         url: req.url,
//         headers: req.headers,
//         payload: req.body,
//         statusCode : res.statusCode 
//       };

//       // Log.statusCode = res.statusCode;
//       console.log(res.statusCode)
//       await next();
//       await Log.create(logEntry);
//       logger.info(JSON.stringify(Log));
//     } catch (error) {
//       logger.error(error.message);
//     }
//   });
app.use(async (req, res, next) => {
  try {
    const logEntry = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body,
    };

    
    res.on('finish', async () => {       // Capture the status code when the response is finished
      logEntry.statusCode = res.statusCode;
      await Log.create(logEntry);    // Save log entry to the database
      logger.info(JSON.stringify(logEntry));
    });

    await next(); // Continue with the request
  } catch (error) {
    logger.error(error.message);
  }
});

  

app.use(limiter)
const PORT = process.env.PORT



app.use('/api',router)


async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Connection Established");

        await sequelize.sync();
        console.log("Database Synced successfully");

        app.listen(PORT, () => {
            console.log(`Server is started on port ${PORT}`);
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

startServer();