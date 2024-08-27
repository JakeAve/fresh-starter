export function integerTo32Bits(n: number) {
    if (n < 0 || n > 4294967295) {
        throw new Error("Must be between 0 and 4294967295");
    }
    const byte1 = n & 0xff;
    const byte2 = (n >> 8) & 0xff;
    const byte3 = (n >> 16) & 0xff;
    const byte4 = (n >> 24) & 0xff;
    return new Uint8Array([byte1, byte2, byte3, byte4]);
}

export function _32BitsToInteger(bytes: Uint8Array) {
    if (bytes.length !== 4) {
        throw new Error("Must be Uint8Array length of 4");
    }
    const view = new DataView(bytes.buffer, 0);
    return view.getUint32(0, true);
}

export function hexStrToUint8(hex: string) {
    return new Uint8Array(
        (hex.match(/.{1,2}/g) as RegExpMatchArray).map((h) => parseInt(h, 16)),
    );
}

export function bytesToHexStr(bytes: Uint8Array) {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function base64ToUint8(base64Str: string) {
    return Uint8Array.from(atob(base64Str), (c) => c.charCodeAt(0));
}

export function bytesToBase64Str(bytes: Uint8Array) {
    return btoa(String.fromCharCode(...bytes));
}

export function bytesToBase64Url(bytes: Uint8Array): string {
    return bytesToBase64Str(bytes)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export function base64UrlToUint8(base64UrlStr: string): Uint8Array {
    try {
        const base64Str = base64UrlStr.replace(/-/g, "+").replace(/_/g, "/");

        const binStr = atob(base64Str);
        const bin = new Uint8Array(binStr.length);

        for (let i = 0; i < binStr.length; i++) {
            bin[i] = binStr.charCodeAt(i);
        }

        return bin;
    } catch {
        throw new Error("Failed to decode base64url");
    }
}
