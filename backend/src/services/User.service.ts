import { promises } from "dns";
import UserModel, { IUser } from "../models/User.model";
import { hash, compare } from "bcrypt";

export const createUser = async (user: IUser): Promise<IUser> => {
    const existingUser = await UserModel.findOne({ email: user.email}, { phoneNumber: user.phoneNumber })
     if (existingUser) {
        throw new Error("Utilisateur existe deja")
     }
    const hashedPassword = await hash(user.password, 10);
    const newUser = new UserModel({ ...user, password: hashedPassword});

    return await newUser.save()
}


export const loginUser = async (email : string, password: string): Promise<IUser | null> => {
    const user = await UserModel.findOne({ email});
    if (!user){
        throw new Error("Utilisateur non trouve");
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Mot de passe incorrect")
    }

   // const token = JWT.sign({ id: user._id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '7d'});

    return user
}

export const findUserByUsername = async (username: string): Promise<IUser[]> => {
    const user = await UserModel.find ({
        username: {$regex: username, $options: "i"}
    })

    return user
}