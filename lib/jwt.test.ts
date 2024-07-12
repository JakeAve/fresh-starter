import { assert, assertEquals } from "$std/assert/mod.ts";
import { createJWTPayload, signJwt, verifyJwt } from "./jwt.ts";

Deno.test("createJWTPayload() makes all props", () => {
  const payload = { sub: "example@example.com", aud: "api", iss: "issuer" };
  const jwt = createJWTPayload(payload);

  const props = new Set(["aud", "exp", "iat", "iss", "jti", "nbf", "sub"]);
  for (const k of Object.keys(jwt)) {
    props.delete(k);
  }
  assertEquals(props.size, 0);
});

Deno.test("createJWTPayload() allows original", () => {
  const payload = {
    sub: "example@example.com",
    aud: "api",
    iss: "issuer",
    cool: "cool",
  };
  const jwt = createJWTPayload(payload);

  const props = new Set([
    "aud",
    "exp",
    "iat",
    "iss",
    "jti",
    "nbf",
    "sub",
    "cool",
  ]);
  for (const k of Object.keys(jwt)) {
    props.delete(k);
  }
  assertEquals(props.size, 0);
});

Deno.test("signJwt() signs", async () => {
  const data = { sub: "example@example.com", aud: "api", iss: "issuer" };
  const rawPayload = createJWTPayload(data);

  const token = await signJwt(rawPayload);

  assert(token);

  assertEquals(token.split(".").length, 3);
});

Deno.test("verifyJWT() verifies", async () => {
  const data = { sub: "example@example.com", aud: "api", iss: "issuer" };
  const rawPayload = createJWTPayload(data);

  const token = await signJwt(rawPayload);

  const payload = await verifyJwt(token);

  assertEquals(payload.sub, "example@example.com");
  assertEquals(payload.aud, "api");
  assertEquals(payload.iss, "issuer");
  assertEquals(payload.jti.length, 16);
});
