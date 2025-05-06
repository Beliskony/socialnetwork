var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import UserModel from "../models/User.model";
import { hash, compare } from "bcrypt";
import { injectable } from "inversify";
let UserService = class UserService {
    async createUser(user) {
        const existingUser = await UserModel.findOne({ $or: [{ email: user.email }, { phoneNumber: user.phoneNumber }] });
        if (existingUser) {
            throw new Error("Utilisateur existe deja");
        }
        const hashedPassword = await hash(user.password, 10);
        const newUser = new UserModel({ ...user, password: hashedPassword });
        return await newUser.save();
    }
    async loginUser(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("Utilisateur non trouve");
        }
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect");
        }
        return user;
    }
    async findUserByUsername(username) {
        const user = await UserModel.find({
            username: { $regex: username, $options: "i" }
        });
        return user;
    }
};
UserService = __decorate([
    injectable()
], UserService);
export { UserService };
