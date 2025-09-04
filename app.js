import express from "express";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import router from "./routes.js";
import AppError from "./src/utils/AppError.js";
import errorHandler from "./src/utils/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

// import rateLimit from "express-rate-limit";

const app = express();

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later."
// });

// app.use("/api", limiter); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/public', express.static(path.join(path.resolve(), 'public')));

app.use("/uploads", express.static(path.join(__dirname, "public/images")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Add this line after your existing static file configurations
app.use("/documents", express.static(path.join(__dirname, "public/documents")));



app.use(cors());

app.options("*", cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(cookieParser());

app.use(mongoSanitize());


app.use("/api", router);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;