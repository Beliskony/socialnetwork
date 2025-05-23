import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import { UserRouter } from "./routes/User.Router";
import { StoryRouter } from "./routes/Story.Router";
import { LikeRouter } from "./routes/Like.Router";
import { PostRouter } from "./routes/Post.Router";
import { CommentRouter } from "./routes/Comment.Router";
import { container } from "./config/container";
import { TYPES } from "./config/TYPES";
import bodyParser from "body-parser";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Injection de dépendances
const userRouter = container.get<UserRouter>(TYPES.UserRouter);
const storyRouter = container.get<StoryRouter>(TYPES.StoryRouter);
const postRouter = container.get<PostRouter>(TYPES.PostRouter);
const likeRouter = container.get<LikeRouter>(TYPES.LikeRouter);
const commentRouter = container.get<CommentRouter>(TYPES.CommentRouter);

// Routes
app.use("/api/user", userRouter.router);
app.use("/api/story", storyRouter.router);
app.use("/api/post", postRouter.router);
app.use("/api/like", likeRouter.router);
app.use("/api/comment", commentRouter.router);


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
