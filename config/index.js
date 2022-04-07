// We reuse this import in order to have access to the `body` property in requests
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");

// ℹ️ Responsible for the messages you see in the terminal as requests are coming in
// https://www.npmjs.com/package/morgan
const logger = require("morgan");

// ℹ️ Needed when we deal with cookies (we will when dealing with authentication)
// https://www.npmjs.com/package/cookie-parser
const cookieParser = require("cookie-parser");

// ℹ️ Needed to accept from requests from 'the outside'. CORS stands for cross origin resource sharing
// unless the request if from the same domain, by default express wont accept POST requests
const cors = require("cors");

// Middleware configuration
module.exports = (app) => {
  // Because this is a server that will accept requests from outside and it will be hosted ona server with a `proxy`, express needs to know that it should trust that setting.
  // Services like heroku use something called a proxy and you need to add this to your server
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESS_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60000000000, // 60 * 1000 ms * 10 === 10 min
      },
    })
  );

  // controls a very specific header to pass headers from the frontend
  app.use(
    cors({
      credentials: true,
      origin: process.env.ORIGIN || "http://localhost:3000",
    })
  );
  app.use(helmet());

  // In development environment the app logs
  app.use(logger("dev"));

  // To have access to `body` property in the request
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({limit: '50mb', extended: false }));
  app.use(cookieParser());
};
