import { assert, assertEquals } from "$std/assert/mod.ts";
import { validateEmail } from "./validateEmail.ts";

Deno.test("validateEmail() happy path", () => {
  assert(validateEmail("joshmo@gmail.com"));
});

Deno.test("validateEmail() bad email", () => {
  assertEquals(validateEmail("joshmo@com"), false);
});
