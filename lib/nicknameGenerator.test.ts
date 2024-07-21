import { assert } from "$std/assert/mod.ts";
import { generateNickname } from "./nicknameGenerator.ts";

Deno.test("generateNickname()", () => {
  const existing = new Set();
  for (let i = 0; i < 10000; i++) {
    existing.add(generateNickname());
  }

  assert(existing.size > 9990);
});
