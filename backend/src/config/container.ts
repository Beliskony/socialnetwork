import { Container } from "inversify";
import { IPostService, PostService } from "../services/Post.service";


export const container: Container = new Container();
container.bind<IPostService>(PostService).to(PostService).inSingletonScope();
