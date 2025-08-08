import { Router } from "express";
import { authController } from "./auth.module";

const routes = Router();
routes.post("/login", authController.login);
routes.post("/register", authController.register);

export default routes;
