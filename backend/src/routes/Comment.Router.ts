import { Router } from "express";
import { CommentController } from "../controllers/commentaireController";
import { CommentMiddleware } from "../middlewares/CommentMiddleware";
import { CreateCommentZodSchema, DeleteCommentZodSchema, UpdateCommentZodSchema } from "../schemas/Comment.ZodSchema";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/TYPES";


@injectable()
export class CommentRouter {
    public router: Router;
    private commentController: CommentController;


    constructor(@inject(TYPES.CommentController) commentController: CommentController) {
        this.router = Router();
        this.commentController = commentController;
        this.initializeRoutes();
    }

  private initializeRoutes(): void {
    this.router.post("/create", CommentMiddleware(CreateCommentZodSchema), this.commentController.addComment.bind(this.commentController));

    this.router.put("/update", CommentMiddleware(UpdateCommentZodSchema), this.commentController.updateComment.bind(this.commentController));

    this.router.delete("/delete", CommentMiddleware(DeleteCommentZodSchema), this.commentController.deleteComment.bind(this.commentController));

    this.router.get("/getAllComments/:postId", this.commentController.getCommentsByPost.bind(this.commentController));

  }
}