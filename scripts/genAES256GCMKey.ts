import { green } from "$std/fmt/colors.ts";
import { bytesToBase64Str, genAESGCMKey } from "../lib/cryptoHelpers.ts";

const key = await genAESGCMKey();

const exportedKey = await crypto.subtle.exportKey("raw", key);
const base64Str = bytesToBase64Str(new Uint8Array(exportedKey));
const variable = `AES_256_GCM_KEY=${base64Str}`;

let contents = "";

try {
  contents = Deno.readTextFileSync(".env");
} catch {
  await Deno.create(".env");
}

if (contents) {
  const regEx = /AES_256_GCM_KEY=?.*/;
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
