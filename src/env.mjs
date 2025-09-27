import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    NETWORK: z.enum(["MAINNET", "TESTNET"]),
    NEXT_PUBLIC_BACKEND_BASE_URL: z.string().min(1),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
    NEXT_PUBLIC_BACKEND_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
    NEXT_PUBLIC_NETWORK: z.enum(["MAINNET", "TESTNET"]),
    NEXT_PUBLIC_CHAIN_ID: z.string().optional(),
    // Legacy support - these will be deprecated in favor of centralized token registry
    NEXT_PUBLIC_SUPERTOKEN: z.string().optional(),
    NEXT_PUBLIC_TOKEN_SYMBOL: z.string().optional(),
    NEXT_PUBLIC_DECIMALS: z.string().optional(),
    NEXT_PUBLIC_PINATA_JWT: z.string().min(1),
    NEXT_PUBLIC_PINATA_GATEWAY_TOKEN: z.string().min(1),
    NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NETWORK: process.env.NETWORK,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,

    // Legacy support
    NEXT_PUBLIC_SUPERTOKEN: process.env.NEXT_PUBLIC_SUPERTOKEN,
    NEXT_PUBLIC_TOKEN_SYMBOL: process.env.NEXT_PUBLIC_TOKEN_SYMBOL,
    NEXT_PUBLIC_DECIMALS: process.env.NEXT_PUBLIC_DECIMALS,

    NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT,
    NEXT_PUBLIC_PINATA_GATEWAY_TOKEN: process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
    const isServer = typeof window === "undefined";

    const parsed = /** @type {MergedSafeParseReturn} */ (
        isServer
            ? merged.safeParse(processEnv) // on server we can validate all env vars
            : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
    );

    if (parsed.success === false) {
        console.error("❌ Invalid environment variables:", {
            errors: parsed.error.flatten().fieldErrors,
        });
        throw new Error("Invalid environment variables");
    }

    env = new Proxy(parsed.data, {
        get(target, prop) {
            if (typeof prop !== "string") return undefined;
            // Throw a descriptive error if a server-side env var is accessed on the client
            // Otherwise it would just be returning `undefined` and be annoying to debug
            if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
                throw new Error(
                    process.env.NODE_ENV === "production"
                        ? "❌ Attempted to access a server-side environment variable on the client"
                        : `❌ Attempted to access server-side environment variable '${prop}' on the client`
                );
            return target[/** @type {keyof typeof target} */ (prop)];
        },
    });
}

export { env };
