import { Framework } from "@superfluid-finance/sdk-core";

/**
 * IDA v1 (Instant Distribution Agreement) Example
 * 
 * IDA allows a publisher to distribute tokens to multiple subscribers instantly.
 * It's useful for scenarios like:
 * - Revenue sharing
 * - Token distributions
 * - Reward systems
 * - Subscription payments
 */

export interface IDAParams {
    superToken: string;
    indexId: string;
    publisher: string;
    subscribers: string[];
    distributionAmount: string;
    userData?: string;
}

export class IDAExample {
    private sf: Framework;
    private chainId: number;
    private signer: any;

    constructor(provider: any, signer: any, chainId: number = 534351) {
        this.chainId = chainId;
        this.signer = signer;
        this.sf = Framework.create({
            chainId,
            provider
        }) as any;
    }

    /**
     * Step 1: Create an index for distribution
     * This creates a unique index that can be used to distribute tokens
     */
    async createIndex(params: {
        superToken: string;
        indexId: string;
        userData?: string;
    }) {
        try {
            console.log("Creating IDA index...");
            const createIndexOperation = this.sf.idaV1.createIndex({
                superToken: params.superToken,
                indexId: params.indexId,
                userData: params.userData || "0x"
            });

            const tx = await createIndexOperation.exec(this.signer);
            console.log("Index created successfully:", tx.hash);
            return tx;
        } catch (error) {
            console.error("Failed to create index:", error);
            throw error;
        }
    }

    /**
     * Step 2: Approve subscription (called by subscriber)
     * Subscribers must approve their subscription to receive distributions
     */
    async approveSubscription(params: {
        superToken: string;
        indexId: string;
        publisher: string;
        userData?: string;
    }) {
        try {
            console.log("Approving subscription...");
            const approveOperation = this.sf.idaV1.approveSubscription({
                superToken: params.superToken,
                indexId: params.indexId,
                publisher: params.publisher,
                userData: params.userData || "0x"
            });

            const tx = await approveOperation.exec(this.signer);
            console.log("Subscription approved:", tx.hash);
            return tx;
        } catch (error) {
            console.error("Failed to approve subscription:", error);
            throw error;
        }
    }

    /**
     * Step 3: Distribute tokens to all subscribers
     * This distributes tokens to all approved subscribers of the index
     */
    async distribute(params: {
        superToken: string;
        indexId: string;
        amount: string;
        userData?: string;
    }) {
        try {
            console.log("Distributing tokens to subscribers...");
            const distributeOperation = this.sf.idaV1.distribute({
                superToken: params.superToken,
                indexId: params.indexId,
                amount: params.amount,
                userData: params.userData || "0x"
            });

            const tx = await distributeOperation.exec(this.signer);
            console.log("Distribution executed:", tx.hash);
            return tx;
        } catch (error) {
            console.error("Failed to distribute tokens:", error);
            throw error;
        }
    }

    /**
     * Step 4: Update subscription units (optional)
     * Allows subscribers to update their subscription units
     */
    async updateSubscriptionUnits(params: {
        superToken: string;
        indexId: string;
        publisher: string;
        units: string;
        userData?: string;
    }) {
        try {
            console.log("Updating subscription units...");
            const updateOperation = this.sf.idaV1.updateSubscriptionUnits({
                superToken: params.superToken,
                indexId: params.indexId,
                subscriber: params.publisher, // Using publisher as subscriber for this example
                units: params.units,
                userData: params.userData || "0x"
            });

            const tx = await updateOperation.exec(this.signer);
            console.log("Subscription units updated:", tx.hash);
            return tx;
        } catch (error) {
            console.error("Failed to update subscription units:", error);
            throw error;
        }
    }

    /**
     * Step 5: Revoke subscription (called by subscriber)
     * Allows subscribers to revoke their subscription
     */
    async revokeSubscription(params: {
        superToken: string;
        indexId: string;
        publisher: string;
        userData?: string;
    }) {
        try {
            console.log("Revoking subscription...");
            const revokeOperation = this.sf.idaV1.revokeSubscription({
                superToken: params.superToken,
                indexId: params.indexId,
                publisher: params.publisher,
                userData: params.userData || "0x"
            });

            const tx = await revokeOperation.exec(this.signer);
            console.log("Subscription revoked:", tx.hash);
            return tx;
        } catch (error) {
            console.error("Failed to revoke subscription:", error);
            throw error;
        }
    }

    /**
     * Complete IDA workflow example
     * This demonstrates the full flow from creating an index to distributing tokens
     */
    async completeIDAWorkflow(params: IDAParams) {
        try {
            console.log("Starting complete IDA workflow...");

            // Step 1: Create index
            const createIndexTx = await this.createIndex({
                superToken: params.superToken,
                indexId: params.indexId,
                userData: params.userData
            });

            // Step 2: Distribute tokens (subscribers must have approved subscriptions)
            const distributeTx = await this.distribute({
                superToken: params.superToken,
                indexId: params.indexId,
                amount: params.distributionAmount,
                userData: params.userData
            });

            console.log("IDA workflow completed successfully!");
            return {
                createIndexTx,
                distributeTx
            };
        } catch (error) {
            console.error("IDA workflow failed:", error);
            throw error;
        }
    }

    /**
     * Get subscription info
     * Query subscription details for a specific subscriber
     */
    async getSubscriptionInfo(params: {
        superToken: string;
        indexId: string;
        publisher: string;
        subscriber: string;
    }) {
        try {
            const subscription = await this.sf.idaV1.getSubscription({
                superToken: params.superToken,
                indexId: params.indexId,
                publisher: params.publisher,
                subscriber: params.subscriber,
                providerOrSigner: this.sf.settings.provider
            });

            return subscription;
        } catch (error) {
            console.error("Failed to get subscription info:", error);
            throw error;
        }
    }

    /**
     * Get index info
     * Query index details
     */
    async getIndexInfo(params: {
        superToken: string;
        indexId: string;
        publisher: string;
    }) {
        try {
            const index = await this.sf.idaV1.getIndex({
                superToken: params.superToken,
                indexId: params.indexId,
                publisher: params.publisher,
                providerOrSigner: this.sf.settings.provider
            });

            return index;
        } catch (error) {
            console.error("Failed to get index info:", error);
            throw error;
        }
    }
}

/**
 * Usage example:
 * 
 * const ida = new IDAExample(provider);
 * 
 * // Create and distribute
 * await ida.completeIDAWorkflow({
 *   superToken: "0x58f0A7c6c143074f5D824c2f27a85f6dA311A6FB",
 *   indexId: "1",
 *   publisher: "0x...",
 *   subscribers: ["0x...", "0x..."],
 *   distributionAmount: "1000000000000000000", // 1 token
 *   userData: "0x"
 * });
 * 
 * // Subscribe to an index (called by subscriber)
 * await ida.approveSubscription({
 *   superToken: "0x58f0A7c6c143074f5D824c2f27a85f6dA311A6FB",
 *   indexId: "1",
 *   publisher: "0x...",
 *   userData: "0x"
 * });
 */ 