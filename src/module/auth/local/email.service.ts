import { RegisterType } from "../../../validators/auth.validator";

export class EmailPasswordService {
	constructor() {}

	async register(userData: RegisterType) {}

	async login(email: string, password: string) {}
}
