import Stream from "../model/Stream.js";
import User from "../model/User.js";
import Invoice from "../model/Invoice.js";

export const createStream = async (req, res) => {
    try {

        const { tokenSymbol, streamStartTxHash, payrollName, senderWalletAddress, receiverWalletAddress, receiverName, streamStartTime, amount, flowRate, flowRateUnit, chainId } = req.body;
        
        if (!streamStartTime) {
            return res.status(400).json({ error: "Stream start time are required" });
        }

        //get privyId from senderWalletAddress
        const senderPrivyId = await User.findOne({ walletAddress: senderWalletAddress });
        if (!senderPrivyId) {
            return res.status(400).json({ error: "Sender not found" });
        }

        if (senderPrivyId.privyId !== req.privyId) {
            return res.status(400).json({ error: "Sender is not authorized" });
        }

        const stream = new Stream({ tokenSymbol, streamStartTxHash, payrollName, senderWalletAddress, receiverWalletAddress, receiverName, streamStatus: "active", streamStartTime, amount, flowRate, flowRateUnit, chainId });
        await stream.save();
        res.status(201).json(stream);
    } catch (error) {
        console.error("Error creating stream:", error);
        res.status(500).json({ error: "Failed to create stream: " + error });
    }
};

export const getStream = async (req, res) => {
    try {
        const { walletAddress, type, chainId } = req.params;
        if (!walletAddress || !type) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const mergedArray = await Stream.aggregate([
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

export const stopStreamStatus = async (req, res) => {
    try {
        const { id } = req.body;

        const stream = await Stream.findOne({ _id: id });
        if (!stream) {
            return res.status(400).json({ error: "Stream not found" });
        }

        const { streamEndTime, streamStoppedTxHash, documentUrl, invoiceNumber } = req.body;

        const invoice = new Invoice({ invoiceNumber, invoiceType: "stream", invoiceStatus: "paid", documentUrl });
        const invoiceData = await invoice.save();
        if (!invoiceData) {
            return res.status(400).json({ error: "Invoice not found" });
        }

        const updatedStream = await Stream.findOneAndUpdate({ _id: id }, { $set: { streamStatus: "completed", streamStoppedTxHash, streamEndTime, documentUrl, invoiceId: invoice._id } });

        if (!updatedStream) {
            return res.status(400).json({ error: "Stream not found" });
        }

        res.status(200).json(updatedStream);
    } catch (error) {
        console.error("Error updating stream status:", error);
        res.status(500).json({ error: "Failed to update stream status: " + error });
    }
};