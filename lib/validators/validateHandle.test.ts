import { assert, assertThrows } from "$std/assert/mod.ts";
import { validateHandle } from "./validateHandle.ts";

Deno.test("validateHandle() happy path", () => {
  assert(validateHandle("A_new_awesome_handle_1"));
});

Deno.test("validateHandle() too short", () => {
  assertThrows(
    () => validateHandle("a"),
    "Handle must have at least 3 characters",
  );
});

Deno.test("validateHandle() too long", () => {
  assertThrows(
    () => validateHandle("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    "Handle must be no longer than 30 characters",
  );
});

Deno.test("validateHandle() invalid chars", () => {
  assertThrows(
    () => validateHandle("B@D handle"),
    "Handle can only contain letters, numbers and underscores (_)",
  );
});
