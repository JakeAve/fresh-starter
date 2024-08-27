import { generatePBKDF2Hash, genRandomBytes } from "$lib/cryptoHelpers.ts";
import { base64ToUint8, bytesToBase64Str } from "$lib/encoding.ts";

const DEFAULT_SALT_BYTE_LENGTH = 32;
const DEFAULT_PBKDF2_ITERATIONS = 999999;

export async function hashPassword(
    password: string,
    saltBytes = DEFAULT_SALT_BYTE_LENGTH,
    iterations = DEFAULT_PBKDF2_ITERATIONS,
) {
    const salt = genRandomBytes(saltBytes);
    const passwordBytes = new TextEncoder().encode(password);
    const hash = await generatePBKDF2Hash(passwordBytes, salt, iterations);
    const combined = new Uint8Array([...salt, ...new Uint8Array(hash)]);
    return bytesToBase64Str(combined);
}

export async function verifyPassword(
    password: string,
    storedHash: string,
    saltBytes = DEFAULT_SALT_BYTE_LENGTH,
    iterations = DEFAULT_PBKDF2_ITERATIONS,
) {
    try {
        const passwordBytes = new TextEncoder().encode(password);
        const saltAndPassword = base64ToUint8(storedHash);
        const salt = saltAndPassword.slice(0, saltBytes);
        const hash = saltAndPassword.slice(saltBytes);
        const comparedHash = await generatePBKDF2Hash(
            passwordBytes,
            salt,
            iterations,
        );

        new Uint8Array(comparedHash).forEach((int, i) => {
            if (int !== hash[i]) {
                throw new Error("Hashes do not match");
            }
        });

        return true;
    } catch (err) {
        console.error(err);
        throw new Error("Could not verify password");
    }
}
