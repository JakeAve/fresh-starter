import {
    base64UrlToUint8,
    bytesToBase64Url,
    signWithHMAC,
    verifyWithHMAC,
} from "./cryptoHelpers.ts";
import { getHMACKey } from "./getKey.ts";

const key = await getHMACKey();

export async function signJwt(rawPayload: Record<string, string | number>) {
    const encoder = new TextEncoder();

    const header = JSON.stringify({
        "alg": "HS256",
        "typ": "JWT",
    });
    const payload = JSON.stringify(rawPayload);

    const base64Header = bytesToBase64Url(encoder.encode(header));
    const base64Payload = bytesToBase64Url(encoder.encode(payload));
    const signature = await signWithHMAC(
        key,
        encoder.encode(base64Header + "." + base64Payload),
    );

    const base64Signature = bytesToBase64Url(new Uint8Array(signature));

    return `${base64Header}.${base64Payload}.${base64Signature}`;
}

export async function verifyJwt(token: string) {
    const encoder = new TextEncoder();
    const [headerB64Url, payloadB64Url, signatureB64Url] = token.split(".");

    const data = `${headerB64Url}.${payloadB64Url}`;

    const signature = base64UrlToUint8(signatureB64Url);

    const isVerified = await verifyWithHMAC(
        key,
        signature,
        encoder.encode(data),
    );

    if (!isVerified) {
        throw new Error("Invalid JWT");
    }

    return isVerified;
}
