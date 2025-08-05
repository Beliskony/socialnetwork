import { IUserPopulated } from "./comment.Interfaces";

export interface INotification extends Document {
    recipient: string; // Référence à l'utilisateur destinataire
    sender: IUserPopulated; // Référence à l'utilisateur expéditeur
    type: 'like' | 'comment' | 'follow'; // Type de notification
    post?: {
        _id: string;
        content?: string;
    }; // Référence au post concerné (optionnel)
    content?: string; // Contenu de la notification (optionnel)
    isRead: boolean; // Indique si la notification a été lue
    createdAt: Date; // Date de création de la notification
}