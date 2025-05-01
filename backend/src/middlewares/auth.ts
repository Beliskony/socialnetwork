import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface AuthRequest extends Request {
    userId?: string | object;
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
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded; // Attache les données utilisateur au request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

// Fonction pour inscrire un nouvel utilisateur
export const registerUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Sauvegarder l'utilisateur dans la base de données (exemple simplifié)
        // Remplacez ceci par votre logique de base de données
        const newUser = { id: Date.now(), username, password: hashedPassword };

        // Générer un token JWT
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: "message" });
    }
};

// Fonction pour authentifier un utilisateur
export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Rechercher l'utilisateur dans la base de données (exemple simplifié)
        // Remplacez ceci par votre logique de base de données
        const user = { id: 1, username: 'test', password: await bcrypt.hash('password', 10) }; // Exemple utilisateur

        if (user.username !== username) {
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