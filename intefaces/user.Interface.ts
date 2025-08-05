export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string; // Le mot de passe est rarement transmis côté client
  profilePicture?: string;
  phoneNumber?: string;
  followers?: string[]; // IDs des utilisateurs suivis
  otp?: string;
  otpExpires?: number;
  createdAt?: string;
  updatedAt?: string;
}