import { Router } from "express";
import { UserController } from "../controllers/userController";
import {  loginUser, registerUser, } from "../middlewares/auth";
import { UserZodSchema, LoginZodSchema } from "../schemas/User.ZodSchema";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/TYPES";

@injectable()
export class UserRouter {
    public router: Router;
    private userController: UserController;


    constructor(@inject(TYPES.UserController) userController: UserController) {
        this.router = Router();
        this.userController = userController;
        this.initializeRoutes();
    }

  private initializeRoutes(): void {
    this.router.get ("/search/:username", this.userController.findUserByUsername.bind(this.userController));

    this.router.post("/register",registerUser(UserZodSchema), this.userController.createUser.bind(this.userController));

    this.router.post("/login",loginUser(LoginZodSchema) , this.userController.loginUser.bind(this.userController));
  }
}