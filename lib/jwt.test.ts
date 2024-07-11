import {
    assert,
    assertEquals,
} from "$std/assert/mod.ts";
import { signJwt, verifyJwt } from "./jwt.ts";

Deno.test("signJWT() signs", async () => {
    const rawPayload = { name: "John", email: "example@example.com" };

    const token = await signJwt(rawPayload);

    assert(token);

    assertEquals(token.split('.').length, 3);
});

Deno.test("verifyJWT() verifies", async () => {
    const rawPayload = { name: "John", email: "example@example.com" };

    const token = await signJwt(rawPayload);

    const isVerified = await verifyJwt(token);
    
    assert(isVerified);
});
