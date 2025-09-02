import mongoose, { Document } from "mongoose";

export interface EmailVerification {
	status: "unverified" | "verified" | "expired";
	attempts?: number;
	strategy?: "email" | "sms" | "oauth" | "admin";
	expiresAt?: Date;
	verifiedAt?: Date;
}

export interface EmailAddress extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	email: string;
	isPrimary: boolean;
	isSecondary?: boolean;
	verification: EmailVerification;
	createdAt: Date;
	updatedAt: Date;
}

const EmailVerificationSchema = new mongoose.Schema<EmailVerification>({
	status: { type: String, enum: ["unverified", "verified", "expired"], default: "unverified" },
	attempts: { type: Number, default: 0 },
	strategy: { type: String, enum: ["email", "sms", "oauth", "admin"], default: "email" },
	expiresAt: { type: Date, default: null },
	verifiedAt: { type: Date, default: null },
});

const EmailAddressSchema = new mongoose.Schema<EmailAddress>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		email: { type: String, required: true, unique: true },
		isPrimary: { type: Boolean, default: false },
		isSecondary: { type: Boolean, default: false },
		verification: { type: EmailVerificationSchema, required: true },
	},
	{ timestamps: true }
);

/** Normalize email before validation/save */
EmailAddressSchema.pre("validate", function (next) {
	if (this.isModified("email") && typeof this.email === "string") {
		this.email = this.email.trim().toLowerCase();
	}
	// Optional guard: avoid both primary & secondary true
	if (this.isPrimary && this.isSecondary) {
		this.isSecondary = false;
	}
	next();
});

/** Indexes **/
EmailAddressSchema.index({ userId: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } });

/** Static helper: promote one email to primary (atomic) */
EmailAddressSchema.statics.setPrimary = async function (userId: mongoose.Types.ObjectId, emailId: mongoose.Types.ObjectId) {
	const session = await this.startSession();
	await session.withTransaction(async () => {
		await this.updateMany({ userId }, { $set: { isPrimary: false } }, { session });
		await this.updateOne({ _id: emailId, userId }, { $set: { isPrimary: true, isSecondary: false } }, { session });
	});
	session.endSession();
};

export default mongoose.model<EmailAddress>("EmailAddress", EmailAddressSchema);
