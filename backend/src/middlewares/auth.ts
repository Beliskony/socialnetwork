import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.model'; // Assurez-vous que le modèle User est correctement importé

interface AuthRequest extends Request {
    user?: {_id: string, username: string}; // Ajout d'un type pour userId
  }
// Clé secrète pour signer les tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware pour vérifier le token JWT
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { _id: string, username: string };
        req.user = decoded; // Attache les données utilisateur au request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

// Fonction pour inscrire un nouvel utilisateur
export const registerUser = async (req: Request, res: Response) => {
    const { username, password, email, phoneNumber  } = req.body;

    if (!username || !password || !email || !phoneNumber) {
        return res.status(400).json({ message: 'Tout les champs sont requis' });
    }

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Sauvegarder l'utilisateur dans la base de données (exemple simplifié)
        // Remplacez ceci par votre logique de base de données
        const newUser = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            followers: [], // Initialiser avec un tableau vide
        }) 

        // Générer un token JWT
        const token = jwt.sign({ _id: newUser._id, username: newUser.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: "message" });
    }
};

// Fonction pour authentifier un utilisateur
export const loginUser = async (req: Request, res: Response) => {
    const { usernameOrphoneNumber, password } = req.body;

    if (!usernameOrphoneNumber || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Rechercher l'utilisateur dans la base de données (exemple simplifié)
        const user = await UserModel.findOne({
            $or: [{ username: usernameOrphoneNumber }, { phoneNumber: usernameOrphoneNumber }],})

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Générer un token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: "message" });
    }
};