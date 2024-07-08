import { assert, assertThrows } from "$std/assert/mod.ts";
import { validateEmail } from "./validateEmail.ts";

Deno.test("validateEmail() happy path", () => {
  assert(validateEmail("joshmo@gmail.com"));
});

Deno.test("validateEmail() blank email", () => {
  assertThrows(
    () => validateEmail(""),
    "Email cannot be blank",
  );
});

Deno.test("validateEmail() bad email", () => {
  assertThrows(
    () => validateEmail("joshmo@com"),
    "Invalid email: joshmo@com",
  );
});
