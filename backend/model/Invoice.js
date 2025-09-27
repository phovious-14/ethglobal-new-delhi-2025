import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true },
    documentUrl: { type: String, required: true },
    invoiceType: { type: String, required: true, enum: ["stream", "instant"] },
    invoiceStatus: { type: String, required: true, default: "pending", enum: ["pending", "paying", "paid", "failed"] },
    createdAt: { type: Date, default: Date.now },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;