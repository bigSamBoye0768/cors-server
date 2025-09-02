import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/databse";
import { StatusCodes } from "http-status-codes";
import emailAuthRoutes from "./module/auth/local/email.route";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

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

app.use(requestId());

const basePath = process.env.BASE_PATH!;
const port = parseInt(process.env.PORT!) || 3000;

app.get("/", (req: Request, res: Response) => {
	res.status(StatusCodes.OK).json({ server: "Hello From Cors Server..." });
});

app.use(`${basePath}/auth`, emailAuthRoutes);

app.use(notFound());

app.use(
	errorHandler({
		env: process.env.NODE_ENV as any,
		includeStack: true,
		includeCauses: 2,
		maxStackLines: 15,
		allowDebugHeader: "x-vault-debug",
		showDebugForIPs: ["127.0.0.1", "::1"],
		// disableDebug: true                 // hard kill switch
	})
);

app.listen(port, async () => {
	console.log(`Server running on http://localhost:${port}`);
	await connectDB();
});
