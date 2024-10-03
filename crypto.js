/**
 * Generates a pair of ECDSA keys and stores them in the global window object.
 * @async
 * @returns {Promise<void>} A promise that resolves when the keys are generated and stored.
 * @throws Will throw an error if key generation fails.
 */
async function generateKeys() {
    try {
        window.userId = window.crypto.getRandomValues(new Uint32Array(1))[0];
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-384"
            },
            true,
            ["sign", "verify"]
        );
        window.keys = window.keys || {};
        window.keys[window.userId] = {
            publicKey: await window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
            privateKey: await window.crypto.subtle.exportKey("jwk", keyPair.privateKey)
        };
        console.log(window.keys, window.userId);
    } catch (error) {
        console.error("Error generating keys:", error);
        localMessage(window.userId, "generateKeys", error.message);
        throw new Error("Key generation failed: " + error.message);
    }
}

/**
 * Hashes a message using SHA-256.
 * @async
 * @param {string} message - The message to hash. 
 * @returns {Promise<string>} The SHA-256 hash of the message.
 * @throws Will throw an error if hashing fails.
 */
async function hashMessage(message) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error("Error hashing message:", error);
        localMessage(window.userId, "hashMessage", error.message);
        throw new Error("Message hashing failed: " + error.message);
    }
}