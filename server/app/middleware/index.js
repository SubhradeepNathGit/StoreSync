const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, 
    message: {
        status: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: {
        status: false,
        message: "Too many login/registration attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = (app) => {
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(",") 
        : ["http://localhost:5173"];
        
    app.use(cors({
        origin: allowedOrigins,
        credentials: true,
    }));

    
    app.use(morgan("dev"));

    
    app.use(helmet());

    
    app.use(compression());

    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    
    app.use("/api/auth", authLimiter);
    app.use("/api", limiter);

    
    app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));
};
