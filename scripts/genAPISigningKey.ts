import { genSigningKeys } from "../lib/apiSigning.ts";

const key = await genSigningKeys();

const privateExport = await crypto.subtle.exportKey("pkcs8", key.privateKey);
const privateStr = btoa(String.fromCharCode(...new Uint8Array(privateExport)));
const privatePemStr =
  `-----BEGIN PRIVATE KEY-----\n${privateStr}\n-----END PRIVATE KEY-----`;

Deno.writeTextFileSync('.api-signing-key', privatePemStr);

const publicExport = await crypto.subtle.exportKey("spki", key.publicKey);
const publicStr = btoa(String.fromCharCode(...new Uint8Array(publicExport)));
const publicPemStr =
  `-----BEGIN PUBLIC KEY-----\n${publicStr}\n-----END PUBLIC KEY-----`;

Deno.writeTextFileSync('.api-signing-key.pub', publicPemStr);
