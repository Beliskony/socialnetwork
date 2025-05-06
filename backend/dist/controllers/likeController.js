var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable } from 'inversify';
import { LikeProvider } from '../providers/Like.provider';
{ /* // Ajouter un like
export const addLike = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;

        const existingLike = await LikeModel.findOne({ userId, postId });
        if (existingLike) {
            return res.status(400).json({ message: 'Like already exists' });
        }

        const newLike = new LikeModel({ userId, postId });
        await newLike.save();

        res.status(201).json({ message: 'Like added successfully', like: newLike });
    } catch (error) {
        res.status(500).json({ message: 'Error adding like', error });
    }
};

// Supprimer un like
export const removeLike = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;

        const like = await LikeModel.findOneAndDelete({ userId, postId });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }

        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing like', error });
    }
};

// Obtenir tous les likes pour un post
export const getLikesForPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const likes = await LikeModel.find({ postId });
        res.status(200).json({ likes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};*/
}
let LikeController = class LikeController {
    likeProvider;
    constructor(likeProvider) {
        this.likeProvider = likeProvider;
    }
    async addLike(req, res) {
        try {
            const { userId, postId } = req.body;
            const existingLike = await this.likeProvider.hasUserLiked(userId, postId);
            if (existingLike) {
                return res.status(400).json({ message: 'Like already exists' });
            }
        }
        catch (error) {
            return res.status(500).json({ message: 'Error checking like', error });
        }
    }
    async removeLike(req, res) {
        try {
            const { userId, postId } = req.body;
            await this.likeProvider.removeLike(userId, postId);
            res.status(200).json({ message: 'Like removed successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error removing like', error });
        }
    }
    async getLikesForPost(req, res) {
        try {
            const { postId } = req.params;
            const likes = await this.likeProvider.getLikesByPost(postId);
            res.status(200).json({ likes });
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching likes', error });
        }
    }
    async hasUserLiked(req, res) {
        try {
            const { userId, postId } = req.body;
            const hasLiked = await this.likeProvider.hasUserLiked(userId, postId);
            res.status(200).json({ hasLiked });
        }
        catch (error) {
            res.status(500).json({ message: 'Error checking like', error });
        }
    }
};
LikeController = __decorate([
    injectable(),
    __param(0, inject(LikeProvider)),
    __metadata("design:paramtypes", [LikeProvider])
], LikeController);
export { LikeController };
