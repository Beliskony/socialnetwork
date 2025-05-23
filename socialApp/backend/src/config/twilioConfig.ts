import twilio from "twilio";

export const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Numéro Twilio