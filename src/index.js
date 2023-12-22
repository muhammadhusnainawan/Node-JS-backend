import dotenv from "dotenv";
import connectDb from "./db/index.js"
import {app} from "./app.js"

// dotenv config
dotenv.config({path:"./.env"})

// conect db
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on PORT : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MonogDb connection failed !!! ", error)
})