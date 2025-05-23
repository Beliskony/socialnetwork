import { Router } from "express";
import { PostController } from "../controllers/postController";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/TYPES";
import { CreatePostRequest } from "../middlewares/CreatePostMiddleware";
import { DeletePostSchema } from "../schemas/Delete.Post.ZodSchema";
import { DeletePostMiddleware } from "../middlewares/DeletePostMiddleware";
import { UpdatePostMiddleware } from "../middlewares/UpdatePostMiddleware";
import { PostZodSchema } from "../schemas/Post.ZodSchema";
import { PostUpdateZodSchema } from "../schemas/Update.PostZodschema";

@injectable()
export class PostRouter {
    public router: Router;
    private postController: PostController;

    constructor(@inject(TYPES.PostController) postController: PostController) {
        this.router = Router();
        this.postController = postController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/create/:user", CreatePostRequest(PostZodSchema), this.postController.createPost.bind(this.postController));
        this.router.delete("/delete/:user/:postId", DeletePostMiddleware(DeletePostSchema), this.postController.deletePost.bind(this.postController));
        this.router.patch("/update/:user/:postId", UpdatePostMiddleware(PostUpdateZodSchema), this.postController.updatePost.bind(this.postController));
        this.router.get("/getUserPost", this.postController.getPosts.bind(this.postController));
        this.router.get("/getAllPosts", this.postController.getAllPosts.bind(this.postController));
    }
}