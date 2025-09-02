import { EmailPasswordController } from "./email.controller";
import { EmailPasswordService } from "./email.service";

const authService = new EmailPasswordService();
const authController = new EmailPasswordController(authService);

export { authController, authService };
