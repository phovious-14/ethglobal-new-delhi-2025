import mongoose from "mongoose";

const instantSchema = new mongoose.Schema({
    tokenSymbol: { type: String, required: true, enum: ["PYUSDx"] },
    payrollName: { type: String, required: true },
    senderWalletAddress: { type: String, required: true },
    receiverWalletAddress: { type: String, required: true },
    receiverName: { type: String, required: true },
    amount: { type: String, required: true }, // we will store the amount in wei
    chainId: { type: String, required: true },
    txHash: { type: String, required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Instant = mongoose.model("Instant", instantSchema);

export default Instant;
