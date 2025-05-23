import express from 'express';
import { inject, injectable } from 'inversify';
import { z } from 'zod';
import { LikeController } from '../controllers/likeController';
import { TYPES } from '../config/TYPES';
import { LikeRequest } from '../middlewares/LikeMiddleware';
import { LikeZodSchema } from '../schemas/Like.ZodSchema';


@injectable()
export class LikeRouter {
    public router: express.Router;
    private likeController: LikeController;

    constructor(@inject(TYPES.LikeController) likeController: LikeController) {
        this.router = express.Router();
        this.likeController = likeController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/add', LikeRequest(LikeZodSchema), this.likeController.addLike.bind(this.likeController));
        this.router.delete('/remove', LikeRequest(LikeZodSchema), this.likeController.removeLike.bind(this.likeController));
        this.router.get('/post/:postId', this.likeController.getLikesForPost.bind(this.likeController));
    }
}