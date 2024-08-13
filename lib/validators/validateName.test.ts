import { assert, assertThrows } from "$std/assert/mod.ts";
import { validateName } from "./validateName.ts";

Deno.test("validateHandle() happy path", () => {
    assert(validateName("jo shmo"));
    assert(validateName("百姓"));
});

Deno.test("validateName() too short", () => {
    assertThrows(
        () => validateName(""),
        "Name must have at least 1 character",
    );
});

Deno.test("validateName() too long", () => {
    assertThrows(
        () =>
            validateName(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            ),
        "Name must be no longer than 50 characters",
    );
});

Deno.test("validateName() invalid chars", () => {
    assertThrows(
        () => validateName("B$D handle"),
        "Name doesn't allow certain special characters",
    );
    assertThrows(
        () => validateName("select * from"),
        "Name doesn't allow certain special characters",
    );
    assertThrows(
        () => validateName("<script>"),
        "Name doesn't allow certain special characters",
    );
    assertThrows(
        () => validateName("https://foo.com"),
        "Name doesn't allow certain special characters",
    );
});
