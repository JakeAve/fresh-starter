import { assert, assertEquals } from "$std/assert/mod.ts";
import { validateHandle } from "./validateHandle.ts";


Deno.test("validateHandle() happy path", () => {
  assert(validateHandle("A_new_awesome_handle_1"));
});

Deno.test("validateHandle() too short", () => {
  assertEquals(validateHandle("a"), false);
});

Deno.test("validateHandle() too long", () => {
  assertEquals(validateHandle("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), false);
});

Deno.test("validateHandle() invalid chars", () => {
  assertEquals(validateHandle("B@D handle"), false);
});
