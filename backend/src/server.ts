import express, { Router } from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/database"
import { UserRouter } from "./routes/User.Router"
import { container } from "./config/container"



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

//container inversify
const userRouter = container.get<UserRouter>("UserRouter")


//start server
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log(`serveur lancer sur ${PORT}`))

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Error starting server:", error)
    }
}

//routes

//routes pour User
app.use("/api/user", userRouter.router)

//routes pour Post
