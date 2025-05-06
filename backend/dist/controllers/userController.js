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
import { inject, injectable } from "inversify";
import { UserProvider } from "../providers/User.provider";
import { TYPES } from "../config/TYPES";
let UserController = class UserController {
    userProvider;
    constructor(userProvider) {
        this.userProvider = userProvider;
    }
    // Créer un nouvel utilisateur
    async createUser(req, res) {
        try {
            const user = req.body;
            const newUser = await this.userProvider.createUser(user);
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Connexion d'un utilisateur
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.userProvider.loginUser(email, password);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    // Rechercher un utilisateur par username
    async findUserByUsername(req, res) {
        try {
            const { username } = req.params;
            const users = await this.userProvider.findUserByUsername(username);
            res.status(200).json(users);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};
UserController = __decorate([
    injectable(),
    __param(0, inject(TYPES.UserProvider)),
    __metadata("design:paramtypes", [UserProvider])
], UserController);
export { UserController };
