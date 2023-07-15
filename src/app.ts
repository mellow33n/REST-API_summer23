/* The required modules are imported:

express is imported as the main framework for building the web application.
dotenv is imported to handle environment variables.
cors is imported to enable Cross-Origin Resource Sharing.
helmet is imported to add security headers to HTTP responses. 
*/


import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./users/users.routes";
import { productRouter } from "./products/product.routes";


dotenv.config();


if (!process.env.PORT) {
  console.log(`No port value specified...`);
}

const PORT = parseInt(process.env.PORT as string, 10);

// An instance of the Express application is created using express() and assigned to the app variable.
const app = express();

/* 
Middleware functions are added to the Express application:

express.json() is used to parse JSON bodies of incoming requests.
express.urlencoded({extended : true}) is used to parse URL-encoded bodies of incoming requests.
cors() is used to enable Cross-Origin Resource Sharing.
helmet() is used to enhance the security of the application by setting various HTTP headers. 
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());


app.use("/", userRouter);
app.use("/", productRouter);

// The Express application starts listening on the specified PORT by calling app.listen().
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
