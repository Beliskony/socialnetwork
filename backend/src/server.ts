import express, { Router } from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/database"



const app = express()
dotenv.config()

//midleware
app.use(express.json())

//utilisation propre de cors
app.use(cors({
    origin: process.env.Client_URL || "*",
    methods: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["Content-type", "Authorization"]
})
)

//connect DB
connectDB()

//routes



//start server
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log(`serveur lancer sur ${PORT}`))
