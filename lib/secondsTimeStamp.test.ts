import { assert, assertEquals } from "$std/assert/mod.ts";
import {
  areSecondsEqualToDate,
  dateToSeconds,
  secondsToDate,
} from "./secondsTimeStamp.ts";

Deno.test("dateToSeconds()", () => {
  const d = new Date("01-01-2000");
  const s = dateToSeconds(d);
  const s2 = d.getTime() / 1000;
  assertEquals(s, s2);
});

Deno.test("secondsToDate() happy path", () => {
  const d = new Date("01-01-2000");
  const s = d.getTime() / 1000;
  const d2 = secondsToDate(s);
  assertEquals(d, d2);
});

Deno.test("secondsToDate() with ms", () => {
  const d = new Date("01-01-2000");
  d.setMilliseconds(8545);
  const s = Math.floor(d.getTime() / 1000);
  const d2 = secondsToDate(s);
  d.setMilliseconds(0);
  assertEquals(d, d2);
});

Deno.test("areSecondsEqualToDate()", () => {
  assert(
    areSecondsEqualToDate(1656088167, new Date("2022-06-24T10:29:27-06:00")),
  );
  assertEquals(
    areSecondsEqualToDate(1656088167, new Date("2022-06-24T10:29:27-04:00")),
    false,
  );
  assert(areSecondsEqualToDate(1678876167, new Date("2023-03-15T10:29:27Z")));
  assertEquals(
    areSecondsEqualToDate(1678876167, new Date("2023-03-15T11:29:27Z")),
    false,
  );
  assert(
    areSecondsEqualToDate(1719224967, new Date("2024-06-24T10:29:27+00:00")),
  );
  assertEquals(
    areSecondsEqualToDate(1719224967, new Date("2024-06-24T10:30:27+00:00")),
    false,
  );
  assert(
    areSecondsEqualToDate(1756747767, new Date("2025-09-01T10:29:27-07:00")),
  );
  assertEquals(
    areSecondsEqualToDate(1756747767, new Date("2025-09-01T10:29:27-07:02")),
    false,
  );
  assert(
    areSecondsEqualToDate(1796891367, new Date("2026-12-10T10:29:27+02:00")),
  );
  assertEquals(
    areSecondsEqualToDate(1796891367, new Date("2026-12-10T10:29:27+02:01")),
    false,
  );
});
