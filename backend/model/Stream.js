import mongoose from "mongoose";

const streamSchema = new mongoose.Schema({
    tokenSymbol: { type: String, required: true, enum: ["PYUSDx"] },
    payrollName: { type: String, required: true },
    senderWalletAddress: { type: String, required: true },
    receiverWalletAddress: { type: String, required: true },
    receiverName: { type: String, required: true },
    streamStatus: { type: String, required: true, default: "inactive", enum: ["active", "inactive", "cancelled"] },
    streamStartTime: { type: Date, required: true },
    streamEndTime: { type: Date },
    amount: { type: String, required: true },
    flowRate: { type: String, required: true },
    flowRateUnit: { type: String, required: true, enum: ["hour", "day", "week", "month"] },
    documentUrl: { type: String },
    streamStartTxHash: { type: String, required: true },
    streamStoppedTxHash: { type: String },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    createdAt: { type: Date, default: Date.now },
    chainId: { type: String, required: true },
});

const Stream = mongoose.model("Stream", streamSchema);

export default Stream;
