import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';


// Fonction pour inscrire un nouvel utilisateur
export const registerUser = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Valider les données d'inscription
      next(); // Passer au contrôleur si les données sont valides
    } catch (error) {
      res.status(400).json({ message: 'Validation error', errors: error });
    }
  };
};

// Fonction pour authentifier un utilisateur
export const loginUser = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // Valider les données de connexion
      next(); // Passer au contrôleur si les données sont valides
    } catch (error) {
      res.status(400).json({ message: 'Validation error', errors: error });
    }
  };
};