import {
    assert,
    assertEquals,
    assertNotEquals,
    assertRejects,
} from "$std/assert/mod.ts";
import { hashPassword, verifyPassword } from "$lib/passwordHashing.ts";

Deno.test("hashPassword() is random every time", async () => {
    const hash = await hashPassword("foo");

    assertEquals(hash.length, 88);
    assertNotEquals(
        hash,
        "8OzEN9ZHW/MKAYv+ogA2RXEemE+Q3fToEvm5W3ld46A0V5WAzovhoAjVZFw48OZY0rVwGLNrd/ku5Jq8Ce6FCQ==",
    );
});

Deno.test("verifyPassword() works", async () => {
    const hash = await verifyPassword(
        "foo",
        "8OzEN9ZHW/MKAYv+ogA2RXEemE+Q3fToEvm5W3ld46A0V5WAzovhoAjVZFw48OZY0rVwGLNrd/ku5Jq8Ce6FCQ==",
    );

    assert(hash);
});

Deno.test({
    name: "verifyPassword() invalid",
    fn: () => {
        assertRejects(() =>
            verifyPassword(
                "fooo",
                "8OzEN9ZHW/MKAYv+ogA2RXEemE+Q3fToEvm5W3ld46A0V5WAzovhoAjVZFw48OZY0rVwGLNrd/ku5Jq8Ce6FCQ==",
            ), "Could not verify password");
    },
    sanitizeOps: false,
});
