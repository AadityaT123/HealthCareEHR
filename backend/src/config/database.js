import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool : {
            max: 10,
            min: 0,
            acquire:30000,
            idle:10000,
        }
    }
);

const connectDB = async() => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection failed", error.message);
        process.exit(1);
    }
};

export { sequelize, connectDB };