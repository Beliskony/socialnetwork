import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import { UserRouter } from "./routes/User.Router";
import { container } from "./config/container";
import { TYPES } from "./config/TYPES";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Injection de dépendances
const userRouter = container.get<UserRouter>(TYPES.UserRouter);

// Routes
app.use("/api/user", userRouter.router);

// Fonction de démarrage
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur :", error);
  }
};

startServer(); // ← C’est maintenant ici que le serveur démarre
