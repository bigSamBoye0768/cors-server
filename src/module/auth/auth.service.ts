// import { RegisterDto } from "../../interface/auth.interface";
import UserModel, { User } from "../../database/user.model";
import { BadRequestException } from "../../utils/errors/bad-request.error";
import { ErrorCodeMessages, ErrorCode } from "../../utils/errors/error-codes";
import { RegisterType } from "../../validators/auth.validator";

export class AuthService {
    constructor() {}

    async register(userData: RegisterType) {
        // const user = new this.userModel(userData);
        // return await user.save();

        const existingUser = await UserModel.findOne({ email: userData.email });

        if (existingUser) {
            throw new BadRequestException(ErrorCodeMessages[ErrorCode.AUTH_EMAIL_ALREADY_EXISTS], ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
        }

        const newUser = new UserModel(userData);
        const user = await newUser.save();
        if (!user) {
            throw new BadRequestException(ErrorCodeMessages[ErrorCode.AUTH_USER_CREATION_FAILED], ErrorCode.AUTH_USER_CREATION_FAILED);
        }

        console.log("User registered:", user);

        // Email verification or maybe even before saving user in DB
        // Send verification link to user's email

        return {
            email: user.emailAddresses[0]?.email,
            id: user._id,
        };
    }

    //   async login(email: string, password: string) {
    //     const user = await this.userModel.findOne({ email });
    //     if (user && user.password === password) {
    //       return { message: "Login successful", user };
    //     }
    //     throw new Error("Invalid credentials");
    //   }

    //   async getUserById(userId: string) {
    //     return await this.userModel.findById(userId);
    //   }
}
