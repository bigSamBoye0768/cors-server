import mongoose, { Document } from "mongoose";

export interface EmailVerification {
    status: "unverified" | "verified" | "expired";
    attempts?: number;
    strategy?: "email" | "sms" | "oauth" | "admin";
    expiresAt?: Date;
    verifiedAt?: Date;
}

export interface EmailAddress {
    isPrimary: boolean;
    isSecondary?: boolean; // Optional field to indicate if it's a secondary email
    email: string;
    verification: EmailVerification;
}

export interface PhoneVerification {
    status: "unverified" | "verified" | "expired";
    attempts?: number;
    strategy?: "whatsapp" | "sms" | "oauth" | "admin";
    expiresAt?: Date;
    verifiedAt?: Date;
}

export interface PhoneNumber {
    isPrimary: boolean;
    isSecondary?: boolean; // Optional field to indicate if it's a secondary phone number
    phoneNumber: string;
    verification: PhoneVerification; // Verification details for the phone number
}

export interface ExternalAccount {
    provider: "google" | "facebook" | "twitter" | "github";
    providerId: string; // Unique ID from the provider
    linkedAt: Date; // Timestamp when the account was linked
}

export interface User extends Document {
    username?: string | null;
    emailAddresses: EmailAddress[];
    primaryEmailId: mongoose.Schema.Types.ObjectId; // This can be used to store the primary email address
    secondaryEmailId?: mongoose.Schema.Types.ObjectId; // This can be used to store a secondary email address
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    phoneNumber?: PhoneNumber[] | null;
    userAgent?: string | null;
    externalAccounts?: ExternalAccount[]; // Array of linked external accounts
    ipAddress?: string | null;
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

const EmailVerificationSchema = new mongoose.Schema<EmailVerification>({
    status: { type: String, enum: ["unverified", "verified", "expired"], default: "unverified" },
    attempts: { type: Number, default: 0 },
    strategy: { type: String, enum: ["email", "sms", "oauth", "admin"], default: "email" },
    expiresAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
});

const EmailAddressSchema = new mongoose.Schema<EmailAddress>({
    isPrimary: { type: Boolean, required: true },
    isSecondary: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    verification: { type: EmailVerificationSchema, required: true },
});

const PhoneVerificationSchema = new mongoose.Schema<PhoneVerification>({
    status: { type: String, enum: ["unverified", "verified", "expired   "], default: "unverified" },
    attempts: { type: Number, default: 0 },
    strategy: { type: String, enum: ["whatsapp", "sms", "oauth", "admin"], default: "sms" },
    expiresAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
});

const PhoneNumberSchema = new mongoose.Schema<PhoneNumber>({
    isPrimary: { type: Boolean, required: true },
    isSecondary: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, unique: true },
    verification: { type: PhoneVerificationSchema, required: true },
});

const ExternalAccountSchema = new mongoose.Schema<ExternalAccount>({
    provider: { type: String, enum: ["google", "facebook", "twitter", "github"], required: true },
    providerId: { type: String, required: true, unique: true },
    linkedAt: { type: Date, default: Date.now },
});

// export type UserModelType = mongoose.Model<User, {}>;

const UserSchema = new mongoose.Schema<User>(
    {
        username: { type: String, required: false, unique: true, default: null },
        emailAddresses: { type: [EmailAddressSchema], required: true, unique: true }, // Array of email addresses
        primaryEmailId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
        secondaryEmailId: { type: mongoose.Schema.Types.ObjectId, required: false, unique: true, default: null },
        password: { type: String, required: true },
        firstName: { type: String, required: false, default: null },
        lastName: { type: String, required: false, default: null },
        fullName: { type: String, required: false, default: null },
        phoneNumber: { type: [PhoneNumberSchema], required: false, default: null }, // Array of phone numbers
        hasImage: { type: Boolean, default: false }, // Indicate if the user has an image
        profilePicture: { type: String, required: false, default: null }, // Optional field for profile picture URL
        bio: { type: String, required: false, default: null }, // Optional field
        externalAccounts: { type: [ExternalAccountSchema], required: false, default: [] }, // Array of linked external accounts
        userAgent: { type: String, required: false, default: null },
        ipAddress: { type: String, required: false, default: null },
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

UserSchema.pre("save", function (next) {
    if (this.isModified("password")) {
        // Implement password hashing logic here
        // For example, using bcrypt:
        // this.password = await bcrypt.hash(this.password, 10);
    }
    this.updatedAt = new Date();
    next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    // Implement password comparison logic here
    return this.password === password; // Placeholder logic, replace with actual hashing comparison
};

UserSchema.methods.generateAuthToken = async function (): Promise<string> {
    // Implement token generation logic here
    return "generatedAuthToken"; // Placeholder logic, replace with actual token generation
};

// UserSchema.methods.getPrimaryEmail = function (): string | null {
//     const primaryEmail = this.emailAddresses.find((email) => email.isPrimary);
//     return primaryEmail ? primaryEmail.email : null;
// };

export const UserModel = mongoose.model<User>("User", UserSchema);
