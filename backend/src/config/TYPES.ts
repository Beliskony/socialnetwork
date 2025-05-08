// src/config/TYPES.ts
export const TYPES = {
    // Services
    IUserService: Symbol.for("IUserService"),
    PostService: Symbol.for("PostService"),
    UserService: Symbol.for("UserService"),
    CommentService: Symbol.for("CommentService"),
    StoryService: Symbol.for("StoryService"),
    LikeService: Symbol.for("LikeService"),
    
    // Providers
    UserProvider: Symbol.for("UserProvider"),
    StoryProvider: Symbol.for("StoryProvider"),
    LikeProvider: Symbol.for("LikeProvider"),
    PostProvider: Symbol.for("PostProvider"),
    CommentProvider: Symbol.for("CommentProvider"),
    
    // Controllers
    UserController: Symbol.for("UserController"),
    CommentController: Symbol.for("CommentController"),
    PostController: Symbol.for("PostController"),
    LikeController: Symbol.for("LikeController"),
    StoryController: Symbol.for("StoryController"),
    
    // Routers
    UserRouter: Symbol.for("UserRouter"),
    StoryRouter: Symbol.for("StoryRouter"),
    PostRouter: Symbol.for("PostRouter"),
    CommentRouter: Symbol.for("CommentRouter"),
    LikeRouter: Symbol.for("LikeRouter"),
  };