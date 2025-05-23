import { PostZodSchema } from "../schemas/Post.ZodSchema";
import { CreatePostRequest } from "../middlewares/CreatePostMiddleware";
import { DeletePostMiddleware } from "../middlewares/DeletePostMiddleware";
import { UpdatePostMiddleware } from "../middlewares/UpdatePostMiddleware";
import PostModel from "../models/Post.model";
import { Request, Response } from "express";


// Mocks
jest.mock("../models/Post.model");
jest.mock("../middlewares/CreatePostMiddleware");
jest.mock("../middlewares/DeletePostMiddleware");
jest.mock("../middlewares/UpdatePostMiddleware");
jest.mock("../schemas/Post.ZodSchema", () => ({
  PostZodSchema: {
    parse: jest.fn(),
  },
}));

//pour la creation
describe("Post Middleware", () => {
    const mockRequest = (body: any): Partial<Request> => {
        return {body}
    };
    const mockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn();
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a post and return the created post", async () => {
        const req = mockRequest({
            user: "hdhgjkjdjkd",
            text: "Test Post",
            media: "This is a test post",
    })
           const res = mockResponse();
        (PostModel.create as jest.Mock).mockResolvedValue(req.body);
        (PostZodSchema.parse as jest.Mock).mockReturnValue(req.body);

        const createPostMiddleware = CreatePostRequest(PostZodSchema);
        await createPostMiddleware(req as Request, res as Response, () => {});

        expect(PostModel.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(req.body);
    }
    
    )

    it("should return 400 if post creation fails", async () => {
        const req = mockRequest({
            user: "hdhgjkjdjkd",
            text: "Test Post",
            media: "This is a test post",
        });
        const res = mockResponse();

        (PostModel.create as jest.Mock).mockRejectedValue(new Error("Post creation failed"));
        
        const createPostMiddleware = CreatePostRequest(PostZodSchema);
        await createPostMiddleware(req as Request, res as Response, () => {});

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Post creation failed" });
    })

})

//pour la suppression
describe ("DeletePostMiddleware", () => {
    const mockRequest = (params: any): Partial<Request> => ({ params });
    const mockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn();
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete a post and return the deleted post", async () => {
        const req = mockRequest({ id: "postId123" });
        const res = mockResponse();

        (PostModel.findByIdAndDelete as jest.Mock).mockResolvedValue(req.params);

        const deletePostMiddleware = DeletePostMiddleware(PostZodSchema);
        await deletePostMiddleware(req as Request, res as Response, () => {});

        expect(PostModel.findByIdAndDelete).toHaveBeenCalledWith("postId123");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(req.params);
    });

    it("should return 404 if post not found", async () => {
        const req = mockRequest({ id: "postId123" });
        const res = mockResponse();

        (PostModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        const deletePostMiddleware = DeletePostMiddleware(PostZodSchema);
        await deletePostMiddleware(req as Request, res as Response, () => {});

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    });
})


//pour la mise à jour ou modification
describe("UpdatePostMiddleware", () => {
    const MockRequest = (body: any): Partial<Request> => ({ body });
    const MockResponse = (): Partial<Response> => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn();
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update a post and return the updated post", async () => {
        const req = MockRequest({
            id: "postId123",
            text: "Updated Post",
            media: "This is an updated post",
        });
        const res = MockResponse();

        (PostModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(req.body);

        const updatePostMiddleware = UpdatePostMiddleware(PostZodSchema);
        await updatePostMiddleware(req as Request, res as Response, () => {});

        expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith("postId123", req.body, {
            new: true,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(req.body);
    });

    it("should return 404 if post not found", async () => {
        const req = MockRequest({
            id: "postId123",
            text: "Updated Post",
            media: "This is an updated post",
        });
        const res = MockResponse();

        (PostModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        const updatePostMiddleware = UpdatePostMiddleware(PostZodSchema);
        await updatePostMiddleware(req as Request, res as Response, () => {});

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    })
})