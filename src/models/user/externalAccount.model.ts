import mongoose, { Document } from "mongoose";

export interface ExternalAccount extends Document {
	userId: mongoose.Schema.Types.ObjectId;
	provider: "google" | "facebook" | "twitter" | "github";
	providerId: string; // Unique ID from the provider
	linkedAt: Date; // Timestamp when the account was linked
}

const ExternalAccountSchema = new mongoose.Schema<ExternalAccount>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		provider: { type: String, enum: ["google", "facebook", "twitter", "github", "apple"], required: true },
		providerId: { type: String, required: true },
		linkedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

// Each provider+providerId must be unique
ExternalAccountSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export default mongoose.model<ExternalAccount>("ExternalAccount", ExternalAccountSchema);
