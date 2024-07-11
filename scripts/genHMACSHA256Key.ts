import { green } from "$std/fmt/colors.ts";
import { bytesToBase64Str, genHMACKey } from "../lib/cryptoHelpers.ts";

const key = await genHMACKey();

const exportedKey = await crypto.subtle.exportKey("raw", key);
const base64Str = bytesToBase64Str(new Uint8Array(exportedKey));
const variable = `HMAC_SHA_256_KEY=${base64Str}`;

let contents = "";

try {
  contents = Deno.readTextFileSync(".env");
} catch {
  await Deno.create(".env");
}

if (contents) {
  const regEx = /HMAC_SHA_256_KEY=?.*/;
  if (regEx.test(contents)) {
    contents = contents.replace(regEx, variable);
  } else {
    contents += "\n" + variable;
  }
} else {
  contents = variable;
}

Deno.writeTextFileSync(".env", contents);

console.log(green("Updated successfully 🎊"));
