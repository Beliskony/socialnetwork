import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { UserProvider } from "../providers/User.provider";
import { TYPES } from "../config/TYPES";
import jwt from "jsonwebtoken";

@injectable()
export class UserController {
    constructor(@inject(TYPES.UserProvider) private userProvider: UserProvider) {}

    // Créer un nouvel utilisateur
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = req.body;
            const newUser = await this.userProvider.createUser(user);

            // Génération d'un token JWT
            const token = jwt.sign(
                { _id: newUser._id, username: newUser.username },
                process.env.JWT_SECRET || "your_secret_key",
                { expiresIn: "1h" }
            );

            res.status(201).json({message: "User registered successfully",
                id: newUser._id,
                token,});
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // Connexion d'un utilisateur
    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const user = await this.userProvider.loginUser(email, password);

             // Génération d'un token JWT
             const token = jwt.sign(
                { _id: user?._id, username: user?.username },
                process.env.JWT_SECRET || "your_secret_key",
                { expiresIn: "1h" }
            );
            res.status(200).json({message: "User logged in successfully",
                id: user?._id,
                token,});
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
    
    