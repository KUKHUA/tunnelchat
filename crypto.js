/**
 * This file contains functions for generating keys, hashing messages, signing messages, and verifying signatures.
 */
async function generateKeys() {
    window.userId = window.crypto.getRandomValues(new Uint32Array(1))[0];
    let keyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDSA",
            namedCurve: "P-384"
        },
        true,
        ["sign", "verify"]
    );
    window.keys[window.userId] = {
        publicKey: await window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
        privateKey: keyPair.privateKey
    };
    console.log(window.keys, window.userId);
}


/**
 * 
 * @param {string} message - The message to hash. 
 * @returns The SHA-256 hash of the message.
 */
async function hashMessage(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Signs a message using ECDSA with SHA-256.
 * @param {string} message - The message to sign.
 * @param {CryptoKey} privateKey - The private key for signing.
 * @returns {Promise<string>} A base64-encoded signature.
 */
async function signMessage(message, privateKey) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" }
            },
            privateKey,
            data
        );
        // Convert the signature to base64 for easy transmission
        return btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
    } catch (error) {
        console.error("Error signing message:", error);
        throw error;
    }
}

/**
 * Verifies a signed message using ECDSA with SHA-256.
 * @param {string} message - The original message.
 * @param {string} signature - The base64-encoded signature.
 * @param {CryptoKey} publicKey - The public key for verification.
 * @returns {Promise<boolean>} True if the signature is valid, false otherwise.
 */
async function verifyMessage(message, signature, publicKey) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        // Convert the base64 signature back to ArrayBuffer
        const binarySignature = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const result = await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" }
            },
            publicKey,
            binarySignature,
            data
        );
        return result;
    } catch (error) {
        console.error("Error verifying message:", error);
        throw error;
    }
}


/**
 * 
 * @param {*} userId - The user ID to add to the key store. 
 * @param {*} publicKey - The public key of the userId.
 */
function addToKeyStore(userId, publicKey) {
    window.keys[userId] = { publicKey };
}