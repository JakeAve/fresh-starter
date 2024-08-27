import {
    assertEquals,
    assertThrows,
} from "$std/assert/mod.ts";
import {
    _32BitsToInteger,
    base64ToUint8,
    base64UrlToUint8,
    bytesToBase64Str,
    bytesToBase64Url,
    bytesToHexStr,
    hexStrToUint8,
    integerTo32Bits,
} from "$lib/encoding.ts";

Deno.test("integerTo32Bits() works", () => {
    const val1 = integerTo32Bits(4000000000);
    assertEquals(val1, new Uint8Array([0, 40, 107, 238]));

    const val2 = integerTo32Bits(256);
    assertEquals(val2, new Uint8Array([0, 1, 0, 0]));

    const val3 = integerTo32Bits(0);
    assertEquals(val3, new Uint8Array([0, 0, 0, 0]));
});

Deno.test("integerTo32Bits() throws err outside of params", () => {
    assertThrows(
        () => integerTo32Bits(4294967296),
        "Must be between 0 and 4294967295",
    );
    assertThrows(() => integerTo32Bits(-1), "Must be between 0 and 4294967295");
});

Deno.test("_32BitsToInteger() works", () => {
    const val1 = _32BitsToInteger(new Uint8Array([0, 40, 107, 238]));
    assertEquals(val1, 4000000000);

    const val2 = _32BitsToInteger(new Uint8Array([0, 1, 0, 0]));
    assertEquals(val2, 256);

    const val3 = _32BitsToInteger(new Uint8Array([0, 0, 0, 0]));
    assertEquals(val3, 0);
});

Deno.test("hexStrToUint8()", () => {
    const hex =
        "643a79be2b605494c96224f75f18d563daa98fc5a33d4596b68d5838a47852f9";

    assertEquals(
        hexStrToUint8(hex),
        new Uint8Array([
            100,
            58,
            121,
            190,
            43,
            96,
            84,
            148,
            201,
            98,
            36,
            247,
            95,
            24,
            213,
            99,
            218,
            169,
            143,
            197,
            163,
            61,
            69,
            150,
            182,
            141,
            88,
            56,
            164,
            120,
            82,
            249,
        ]),
    );

    assertEquals(
        new Uint8Array(new TextEncoder().encode("password")),
        hexStrToUint8("70617373776f7264"),
    );
});

Deno.test("bytesToHexStr()", () => {
    const hex = bytesToHexStr(
        new Uint8Array([
            100,
            58,
            121,
            190,
            43,
            96,
            84,
            148,
            201,
            98,
            36,
            247,
            95,
            24,
            213,
            99,
            218,
            169,
            143,
            197,
            163,
            61,
            69,
            150,
            182,
            141,
            88,
            56,
            164,
            120,
            82,
            249,
        ]),
    );

    assertEquals(
        hex,
        "643a79be2b605494c96224f75f18d563daa98fc5a33d4596b68d5838a47852f9",
    );

    assertEquals(
        bytesToHexStr(new TextEncoder().encode("password")),
        "70617373776f7264",
    );
});

Deno.test("bytesToBase64Str()", () => {
    const bytes = new Uint8Array([100, 58, 121, 190, 43, 96, 84, 148]);
    const expectedBase64 = "ZDp5vitgVJQ=";

    const result = bytesToBase64Str(bytes);
    assertEquals(result, expectedBase64);

    assertEquals(
        bytesToBase64Str(new TextEncoder().encode("password")),
        "cGFzc3dvcmQ=",
    );
});

Deno.test("base64ToUint8()", () => {
    const base64Str = "ZDp5vitgVJQ=";
    const expectedBytes = new Uint8Array([100, 58, 121, 190, 43, 96, 84, 148]);

    const result = base64ToUint8(base64Str);
    assertEquals(result, expectedBytes);

    assertEquals(
        new Uint8Array(new TextEncoder().encode("password")),
        base64ToUint8("cGFzc3dvcmQ="),
    );
});

Deno.test("bytesToBase64Url() should convert Uint8Array to Base64Url string", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in ASCII
    const base64Url = bytesToBase64Url(bytes);
    assertEquals(base64Url, "SGVsbG8");
});

Deno.test("base64UrlToUint8() should convert Base64Url string to Uint8Array", () => {
    const base64UrlStr = "SGVsbG8";
    const bytes = base64UrlToUint8(base64UrlStr);
    assertEquals(bytes, new Uint8Array([72, 101, 108, 108, 111])); // "Hello" in ASCII
});

Deno.test("base64UrlToUint8() converts challenge", () => {
    const base64UrlStr = "QOZhzVgLD7PjRJP1qXvEKGU-jItOPGlJog9elrTwCqM";
    const bytes = base64UrlToUint8(base64UrlStr);
    assertEquals(
        bytes,
        new Uint8Array([
            64,
            230,
            97,
            205,
            88,
            11,
            15,
            179,
            227,
            68,
            147,
            245,
            169,
            123,
            196,
            40,
            101,
            62,
            140,
            139,
            78,
            60,
            105,
            73,
            162,
            15,
            94,
            150,
            180,
            240,
            10,
            163,
        ]),
    );
});

Deno.test("base64UrlToUint8() should throw error for invalid Base64Url string", () => {
    assertThrows(
        () => {
            base64UrlToUint8("Invalid_Base64Url");
        },
        Error,
        "Failed to decode base64url",
    );
});
