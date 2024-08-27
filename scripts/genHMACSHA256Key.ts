import { green } from "$std/fmt/colors.ts";
import { genHMACKey } from "$lib/cryptoHelpers.ts";
import { bytesToBase64Str } from "$lib/encoding.ts";

const key = await genHMACKey();

const exportedKey = await crypto.subtle.exportKey("raw", key);
const base64Str = bytesToBase64Str(new Uint8Array(exportedKey));

console.log("Key created:");
console.log(base64Str);

const keyType = prompt(
  "Would you like to update the ACCESS token or REFRESH token? Type access, refresh or no.",
);

if (
  !keyType || (keyType && keyType.toLocaleLowerCase() !== "access" &&
    keyType.toLocaleLowerCase() !== "refresh")
) {
  Deno.exit();
}

const variable = keyType?.toLocaleLowerCase() === "access"
  ? `ACCESS_TOKEN_KEY=${base64Str}`
  : `REFRESH_TOKEN_KEY=${base64Str}`;

let contents = "";

try {
  contents = Deno.readTextFileSync(".env");
} catch {
  await Deno.create(".env");
}

if (contents) {
  const regEx = keyType?.toLocaleLowerCase() === "access"
    ? /ACCESS_TOKEN_KEY=?.*/
    : /REFRESH_TOKEN_KEY=?.*/;
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
