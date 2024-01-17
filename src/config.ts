import dotenv from "dotenv";

dotenv.config();

//Set bot properties.

export default {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
};