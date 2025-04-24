import { injectable } from "inversify";

export interface IPostService {
    createPost(title: string, content: string): Promise<Post>;
    getPost(title: string): Promise<Post | null>
    getAllPosts(): Promise<Post[]>;
    updatePost(id: string, title: string, content: string): Promise<Post | null>;
    deletePost(id: string): Promise<boolean>;
}

@injectable()
export class PostService implements IPostService {
    private posts: Post[] = [];

    async createPost(title: string, content: string): Promise<Post> {
        const newPost: Post = {
            id: (this.posts.length + 1).toString(),
            title,
            content,
            createdAt: new Date(),
        };
        this.posts.push(newPost);
        return newPost;
    }


    async getPost(title: string): Promise<Post | null> {
        return this.posts.find(post => post.title === title) || null
    }

    async getAllPosts(): Promise<Post[]> {
        return this.posts;
    }

    async updatePost(id: string, title: string, content: string): Promise<Post | null> {
        const postIndex = this.posts.findIndex(post => post.id === id);
        if (postIndex === -1) return null;

        this.posts[postIndex] = {
            ...this.posts[postIndex],
            title,
            content,
        };
        return this.posts[postIndex];
    }

    async deletePost(id: string): Promise<boolean> {
        const postIndex = this.posts.findIndex(post => post.id === id);
        if (postIndex === -1) return false;

        this.posts.splice(postIndex, 1);
        return true;
    }
}

// Define the Post type
export interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}