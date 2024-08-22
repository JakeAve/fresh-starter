import { assert, assertEquals } from "$std/assert/mod.ts";
import { createJWTPayload, readJwt, signJwt, verifyJwt } from "./jwt.ts";

Deno.test("createJWTPayload() makes all props", () => {
  const payload = {
    sub: "example@example.com",
    aud: "api",
    iss: "issuer",
    expiresIn: 3600,
  };
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
    expiresIn: 3600,
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
  const data = {
    sub: "example@example.com",
    aud: "api",
    iss: "issuer",
    expiresIn: 3600,
  };
  const rawPayload = createJWTPayload(data);

  const token = await signJwt({ ...rawPayload, expiresIn: 3600 });

  assert(token);

  assertEquals(token.split(".").length, 3);
});

Deno.test("verifyJwt() verifies", async () => {
  const data = {
    sub: "example@example.com",
    aud: "api",
    iss: "issuer",
    expiresIn: 3600,
  };
  const rawPayload = createJWTPayload(data);

  const token = await signJwt({ ...rawPayload, expiresIn: 3600 });

  const payload = await verifyJwt(token);

  assertEquals(payload.sub, "example@example.com");
  assertEquals(payload.aud, "api");
  assertEquals(payload.iss, "issuer");
  assertEquals(payload.jti.length, 16);
});

Deno.test("readJwt() reads valid JWT", async () => {
  const jwt = await signJwt({
    sub: "example@example.com",
    aud: "api",
    iss: "issuer",
    expiresIn: 3600,
  });

  const result = await readJwt(jwt);

  assert(result.isValid);
  assertEquals(result.payload.sub, "example@example.com");
  assertEquals(result.payload.aud, "api");
  assertEquals(result.payload.iss, "issuer");
});

Deno.test("readJwt() reads invalid JWT", async () => {
  const jwt =
    `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleGFtcGxlQGV4YW1wbGUuY29tIiwiYXVkIjoiYXBpIiwiaXNzIjoiaXNzdWVyIiwiaWF0IjoxNzIzMjQ5ODYwLCJleHAiOjE3MjMyNDk4NjEsIm5iZiI6MTcyMzI0OTg2MCwianRpIjoib2ZlTTNMNWtZeVVHV2JmVSJ9.KmpebNZaWmgj6_JZ_7I6dE302FucQtNHYOxBQaeIqzM`;

  const result = await readJwt(jwt);

  assertEquals(result.isValid, false);
  assertEquals(result.payload.sub, "example@example.com");
  assertEquals(result.payload.aud, "api");
  assertEquals(result.payload.iss, "issuer");
});
