import mongoose, { Document } from "mongoose";

export interface PhoneVerification {
	status: "unverified" | "verified" | "expired";
	attempts?: number;
	strategy?: "whatsapp" | "sms" | "oauth" | "admin";
	expiresAt?: Date | null;
	verifiedAt?: Date | null;
}

export interface PhoneNumber extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	phoneNumber: string; // stored normalized (e.g. +15555550123)
	isPrimary: boolean;
	isSecondary?: boolean;
	verification: PhoneVerification;
	createdAt: Date;
	updatedAt: Date;
}

const PhoneVerificationSchema = new mongoose.Schema<PhoneVerification>({
	status: { type: String, enum: ["unverified", "verified", "expired"], default: "unverified" },
	attempts: { type: Number, default: 0 },
	strategy: { type: String, enum: ["whatsapp", "sms", "oauth", "admin"], default: "sms" },
	expiresAt: { type: Date, default: null },
	verifiedAt: { type: Date, default: null },
});

const PhoneNumberSchema = new mongoose.Schema<PhoneNumber>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		phoneNumber: { type: String, required: true, unique: true },
		isPrimary: { type: Boolean, default: false },
		isSecondary: { type: Boolean, default: false },
		verification: { type: PhoneVerificationSchema, required: true, default: () => ({}) },
	},
	{ timestamps: true }
);

/** Normalize phone before save */
PhoneNumberSchema.pre("validate", function (next) {
	if (this.isModified("phoneNumber") && typeof this.phoneNumber === "string") {
		this.phoneNumber = this.phoneNumber.trim();
		// TODO: normalize with libphonenumber-js to E.164 format
		// this.phoneNumber = parsePhoneNumber(this.phoneNumber, 'US')?.number || this.phoneNumber;
	}
	// avoid both primary & secondary true
	if (this.isPrimary && this.isSecondary) {
		this.isSecondary = false;
	}
	next();
});

// At most one primary phone per user
PhoneNumberSchema.index({ userId: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } });

export default mongoose.model<PhoneNumber>("PhoneNumber", PhoneNumberSchema);
