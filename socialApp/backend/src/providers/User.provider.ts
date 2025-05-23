import { inject, injectable } from "inversify";
import { UserService } from "../services/User.service";
import { IUser } from "../models/User.model";
import { TYPES } from "../config/TYPES";

@injectable()
export class UserProvider {
    constructor( @inject(TYPES.UserService) private userService: UserService ) {}

    async createUser(user: IUser): Promise<IUser> {
        return this.userService.createUser(user);
    }

    async loginUser(email: string, password: string): Promise<IUser | null> {
        return this.userService.loginUser(email, password);
    }

    async findUserByUsername(username: string): Promise<IUser[]> {
        return this.userService.findUserByUsername(username);
    }

}