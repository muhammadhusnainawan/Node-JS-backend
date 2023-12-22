import dotenv from "dotenv";
import connectDb from "./db/index.js"

// dotenv config
dotenv.config({path:"./.env"})

// conect db
connectDb()