import { Container } from "inversify";
import {  PostService } from "../services/Post.service";
import { IUserService, UserService } from "../services/User.service";
import { CommentService } from "../services/comment.service";
import { StoryService } from "../services/Story.service";
import { LikeService } from "../services/Like.service";
import { UserProvider } from "../providers/User.provider";
import { StoryProvider } from "../providers/Story.provider";



export const container: Container = new Container();
// services
container.bind<PostService>(PostService).to(PostService).inSingletonScope();
container.bind<IUserService>(UserService).to(UserService).inSingletonScope();
container.bind<CommentService>(CommentService).to(CommentService).inSingletonScope();
container.bind<StoryService>(StoryService).to(StoryService).inSingletonScope();
container.bind<LikeService>(LikeService).to(LikeService).inSingletonScope();


// prviders
container.bind<UserProvider>(UserProvider).to(UserProvider).inSingletonScope();
container.bind<StoryProvider>(StoryProvider).to(StoryProvider).inSingletonScope();