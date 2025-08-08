import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/databse";
import { errorHandle } from "./middleware/error.middleware";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "./utils/async-handler";
import { UnauthorizedException } from "./utils/errors/unauthorized.error";
import authRoutes from "./module/auth/auth.route";
import { NotFoundException } from "./utils/errors/not-found.error";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = ["http://localhost:3000", "https://frontend.app.com"];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

const basePath = process.env.BASE_PATH!;
const port = parseInt(process.env.PORT!) || 3000;

app.get(
    "/",
    asyncHandler((req: Request, res: Response) => {
        throw new UnauthorizedException("Unauthorized access");
        res.status(StatusCodes.OK).json({ server: "Hello From Cors Server..." });
    })
);

app.use(`${basePath}/auth`, authRoutes);

app.use((req: Request, res: Response) => {
    throw new NotFoundException("Route not found");
    // Alternatively, you can send a 404 response directly:
    // res.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
});

app.use(errorHandle);

app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    await connectDB();
});
