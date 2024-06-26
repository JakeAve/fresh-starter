import {
  assertAlmostEquals,
  assertRejects,
} from "$std/assert/mod.ts";
import { decryptSeconds, genAESGCMKey } from "./cryptoHelpers.ts";
import { secondsToDate } from "./secondsTimeStamp.ts";
import { createTimeBasedKey, verifyTimeBasedKey } from "./timeBasedKey.ts";

Deno.test("createTimeBasedKey() 1 hour", async () => {
  const key = await genAESGCMKey();

  const inAnHour = new Date(new Date().getTime() + (1000 * 60 * 60));

  const encrypted = await createTimeBasedKey(key, 3600);

  const decrypted = await decryptSeconds(key, encrypted);

  const expTime = secondsToDate(decrypted);

  assertAlmostEquals(expTime.getTime(), inAnHour.getTime(), 1e7);
});

Deno.test("createTimeBasedKey() 1 day", async () => {
  const key = await genAESGCMKey();

  const inAnHour = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));

  const encrypted = await createTimeBasedKey(key, 86400);

  const decrypted = await decryptSeconds(key, encrypted);

  const expTime = secondsToDate(decrypted);

  assertAlmostEquals(expTime.getTime(), inAnHour.getTime(), 1e7);
});

Deno.test("verifyTimeBasedKey() expired", async () => {
  const key = await genAESGCMKey();

  const tbk = await createTimeBasedKey(key, 1);

  await new Promise((r) =>
    setTimeout(() => {
      r(undefined);
    }, 3000)
  );
  assertRejects(
    () => verifyTimeBasedKey(key, tbk),
    "Time based key is expired",
  );
});

Deno.test("verifyTimeBasedKey() invalid", async () => {
    const key = await genAESGCMKey();
  
    assertRejects(
      () => verifyTimeBasedKey(key, 'dolphin'),
      "Invalid time based key",
    );
  });
