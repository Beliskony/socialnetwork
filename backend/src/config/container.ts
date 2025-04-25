import { Container } from "inversify";
import { IPostService, PostService } from "../services/Post.service";
import { IUserService, UserService } from "../services/User.service";
import { CommentService } from "../services/comment.service";
import { StoryService } from "../services/Story.service";
import { LikeService } from "../services/Like.service";


export const container: Container = new Container();
container.bind<IPostService>(PostService).to(PostService).inSingletonScope();
container.bind<IUserService>(UserService).to(UserService).inSingletonScope();
container.bind<CommentService>(CommentService).to(CommentService).inSingletonScope();
container.bind<StoryService>(StoryService).to(StoryService).inSingletonScope();
container.bind<LikeService>(LikeService).to(LikeService).inSingletonScope();

