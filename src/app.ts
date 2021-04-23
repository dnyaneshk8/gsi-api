import "reflect-metadata";
import { Action, useExpressServer } from "routing-controllers";
const dotenv = require("dotenv");
dotenv.config();
import path from "path";
import bodyParser from "body-parser";
import express from "express";
import authService from "./utils/authService";
import { UserService } from "./api/auth/Auth.Service";
import { authorizationChecker } from "./middlewears/auth";

const app = express();
app.use(bodyParser.json({ limit: "20mb" }));
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOOSE_CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

import "./models";
const controllers =
  process.env.NODE_ENV === "production"
    ? [__dirname + "/api/**/*.controller.js"]
    : [__dirname + "/api/**/*.controller.ts"];
// creates express app, registers all controller routes and returns you express app instance
useExpressServer(app, {
  cors: true,
  classTransformer: true,
  validation: false,
  routePrefix: "api",
  controllers,
  authorizationChecker,
  currentUserChecker: async (action: Action) => {
    // here you can use request/response objects from action
    // you need to provide a user object that will be injected in controller actions
    const authHead = action.request.headers["authorization"];
    if (!authHead) {
      return null;
    }
    let token = authHead.split(" ")[1];
    if (!token) {
      return null;
    }
    console.log("\x1b[33m", "Authorizing request...", "\x1b[0m");
    let user: { data: any } | false = await authService.verifyToken(token);
    if (user) {
      const userRepository = new UserService();
      let userDetails = await userRepository.findByEmail(user["data"].email);
      return userDetails;
    } else {
      return null;
    }
  },
});

app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build"));
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.info("Database connected!");
  console.log("Starting app....");
  // run express application on port 3000
  app.listen(process.env.PORT || 3001);
  app.on("ready", () =>
    console.log("App started on port" + process.env.PORT || 3001)
  );
});
