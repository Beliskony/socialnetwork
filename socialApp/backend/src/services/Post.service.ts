import { injectable } from "inversify";
import PostModel, { IPost } from "../models/Post.model";


@injectable()
export class PostService {

    async createPost(userId: string, text?: string, media?: { images?: string[]; videos?: string[] }): Promise<IPost> {
        const newPost = new PostModel ({
            user: userId,
            text,
            media,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await newPost.save();
    }


    async getPosts(text: string): Promise<IPost[] | null> {
        return await PostModel.find({
            $or: [
                { text: { $regex: text, $options: 'i' } }, // Recherche insensible à la casse
                //{ 'media.images': { $regex: text, $options: 'i' } }, // Recherche dans les images
                //{ 'media.videos': { $regex: text, $options: 'i' } }, // Recherche dans les vidéos
            ],
        }).populate('userId')
    }

    async getAllPosts(): Promise<IPost[]> {
        return await PostModel.find().populate('userId').sort({ createdAt: -1 }).exec();
    }

    async updatePost(postId: string, userId:string,  text?: string, media?: { images?: string[]; videos?: string[] }): Promise<IPost | null> {
        
        console.log("🔍 Tentative de mise à jour");
        console.log("➡️ postId reçu :", postId);
        console.log("➡️ userId reçu :", userId);


        const post = await PostModel.findById(postId)

        if (!post) {
            return null;
        }
        console.log("✅ Post trouvé avec user :", post.user.toString());

        if (post?.user.toString() !== userId) {
            console.log("⛔️ Utilisateur non autorisé");
            throw new Error("You are not authorized to modify this post");
        }

        post.text = text || post.text;
        post.media = media || post.media;
        post.updatedAt = new Date();
        return await post.save();
    }

    async deletePost(postId: string, userId: string): Promise<boolean> {
        const post = await PostModel.findById(postId)
        if (post?.user.toString() !== userId) {
            throw new Error("You are not authorized to modify this post");
        }
        await PostModel.findByIdAndDelete(postId);
        return true;
    }
}
