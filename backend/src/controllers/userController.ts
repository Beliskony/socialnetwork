import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserProvider } from "../providers/User.provider";

@injectable()
export class UserController {
    constructor(@inject(UserProvider) private userProvider: UserProvider) {}

    // Créer un nouvel utilisateur
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = req.body;
            const newUser = await this.userProvider.createUser(user);
            res.status(201).json(newUser);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // Connexion d'un utilisateur
    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const user = await this.userProvider.loginUser(email, password);
            res.status(200).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // Rechercher un utilisateur par username
    async findUserByUsername(req: Request, res: Response): Promise<void> {
        try {
            const { username } = req.params;
            const users = await this.userProvider.findUserByUsername(username);
            res.status(200).json(users);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

}
    
    