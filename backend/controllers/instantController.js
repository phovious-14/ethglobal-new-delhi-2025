import Instant from "../model/Instant.js";
import Invoice from "../model/Invoice.js";

export const createInstant = async (req, res) => {
    try {
        const { tokenSymbol,invoiceNumber, txHash, payrollName, senderWalletAddress, receiverWalletAddress, receiverName, amount, chainId, documentUrl } = req.body;
        
        if (!invoiceNumber || !txHash || !payrollName || !senderWalletAddress || !receiverWalletAddress || !receiverName || !amount || !chainId || !documentUrl) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const invoice = await Invoice.create({ invoiceNumber, documentUrl, invoiceType: "instant", invoiceStatus: "paid" });
        const invoiceData = await invoice.save();

        const newInstant = await Instant.create({ tokenSymbol, txHash, payrollName, senderWalletAddress, receiverWalletAddress, receiverName, amount, chainId, invoiceId: invoiceData._id });
        await newInstant.save()

        res.status(201).json(newInstant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getInstant = async (req, res) => {
    const { walletAddress, type, chainId } = req.params;
    if (!walletAddress || !type) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const mergedArray = await Instant.aggregate([
            {
                $match: { [type === "sender" ? "senderWalletAddress" : "receiverWalletAddress"]: walletAddress, chainId: chainId }
            },
            {
                $lookup: {
                    from: "invoices", // collection name (lowercase)
                    localField: "invoiceId",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            {
                $unwind: {
                    path: "$invoice",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        res.status(200).json(mergedArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

