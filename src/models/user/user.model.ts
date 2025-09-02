import mongoose, { Document } from "mongoose";
import { hashValue, compareHash } from "../../utils/helper";

export interface User extends Document {
	username?: string | null;
	password?: string;
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
	isEmailVerified?: boolean;
	hasImage: boolean; // indicate if the user has an image
	profilePicture?: string; // Optional field for profile picture URL
	bio?: string; // Optional field for user bio
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date; // Optional field to track last login time
	lastLoginIp?: string; // Optional field to track last login IP address
	comparePassword: (password: string) => Promise<boolean>;
	generateAuthToken: () => Promise<string>;
	getPrimaryEmail: () => string | null;
	getSecondaryEmail: () => string | null;
}

const UserSchema = new mongoose.Schema<User>(
	{
		username: { type: String, required: false, unique: true, default: null },
		password: { type: String, required: false },
		firstName: { type: String, required: false, default: null },
		lastName: { type: String, required: false, default: null },
		fullName: { type: String, required: false, default: null },
		hasImage: { type: Boolean, default: false }, // Indicate if the user has an image
		profilePicture: { type: String, required: false, default: null }, // Optional field for profile picture URL
		bio: { type: String, required: false, default: null }, // Optional field
		lastLoginAt: { type: Date, required: false, default: null }, // Optional field to track last login time
		lastLoginIp: { type: String, required: false, default: null }, //
		isEmailVerified: { type: Boolean, default: false },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
		// toJSON: {
		//     virtuals: true,
		//     versionKey: false,
		//     transform: (doc, ret) => {
		//         delete ret._id;
		//         return ret;
		//     },
		// },
		// toObject: {
		//     virtuals: true,
		//     versionKey: false,
		//     transform: (doc, ret) => {
		//         delete ret._id;
		//         return ret;
		//     },
		// },
	}
);

UserSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		if (this.password) this.password = await hashValue(this.password);
	}
	this.updatedAt = new Date();
	next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	if (!this.password) {
		throw new Error("Password not set");
	}
	return await compareHash(password, this.password);
};

const UserModel = mongoose.model<User>("User", UserSchema);
export default UserModel;
export type UserModelType = typeof UserModel;
