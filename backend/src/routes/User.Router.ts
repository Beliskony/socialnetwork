import express, {Request, Response, Router} from "express";
import { UserController } from "../controllers/userController";
import { validateRequest } from "../middlewares/userMiddleware";
import { UserZodSchema, LoginZodSchema } from "../schemas/User.ZodSchema";
import { inject, injectable } from "inversify";

@injectable()
export class UserRouter {
    public router: Router;
    private userController: UserController;

    constructor(@inject("UserController") userController: UserController) {
        this.router = Router();
        this.userController = userController;
        this.initializeRoutes();
    }

  private initializeRoutes() {
    this.router.get ("/search/:username", this.userController.findUserByUsername.bind(this.userController));

    this.router.post("/register",validateRequest(UserZodSchema), this.userController.createUser.bind(this.userController));

    this.router.post("/login",validateRequest(LoginZodSchema) , this.userController.loginUser.bind(this.userController));
  }
}