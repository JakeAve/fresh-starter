import { assertEquals } from "$std/assert/mod.ts";
import { genRegistrationOptions } from "./passkeys.ts";

Deno.test("genRegistrationOptions()", async () => {
  const options = await genRegistrationOptions("jo", "jo@gmail.com", []);

  assertEquals(options.rp, { name: "DOC-5", id: "localhost" });
  assertEquals(options.user.name, "jo");
  assertEquals(options.user.displayName, "jo@gmail.com");
});
