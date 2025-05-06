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
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { validateRequest } from "../middlewares/userMiddleware";
import { UserZodSchema, LoginZodSchema } from "../schemas/User.ZodSchema";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/TYPES";
let UserRouter = class UserRouter {
    router;
    userController;
    constructor(userController) {
        this.router = Router();
        this.userController = userController;
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/search/:username", this.userController.findUserByUsername.bind(this.userController));
        this.router.post("/register", validateRequest(UserZodSchema), this.userController.createUser.bind(this.userController));
        this.router.post("/login", validateRequest(LoginZodSchema), this.userController.loginUser.bind(this.userController));
    }
};
UserRouter = __decorate([
    injectable(),
    __param(0, inject(TYPES.UserController)),
    __metadata("design:paramtypes", [UserController])
], UserRouter);
export { UserRouter };
