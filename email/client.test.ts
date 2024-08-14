import {
    assertEquals,
    assertRejects,
} from "$std/assert/mod.ts";
import { prepareEmail } from "./client.ts";

Deno.test("prepareEmail() for verify email", async () => {
    const result = await prepareEmail("jo@jo.com", "verify-email", {
        USER: "Joe",
        YEAR: new Date().getFullYear().toString(),
        COMPANY: "Biggin Inc",
        LINK: "https://example.com",
    });

    assertEquals(result.emailAddress, "jo@jo.com");
    assertEquals(result.subject, "Verify Email Address");
});

Deno.test("prepareEmail() for reset password", async () => {
    const result = await prepareEmail("jo@jo.com", "reset-password", {
        USER: "Joe",
        YEAR: new Date().getFullYear().toString(),
        CODE: "123456",
        LINK: "https://example.com",
        COMPANY: "Biggin Inc",
    });
    assertEquals(result.emailAddress, "jo@jo.com");
    assertEquals(result.subject, "Reset Password");
});

Deno.test("prepareEmail() unused variable throws", () => {
    assertRejects(() =>
        prepareEmail("jo@jo.com", "reset-password", {
            USER: "Joe",
            YEAR: new Date().getFullYear().toString(),
            LINK: "https://example.com",
            COMPANY: "Biggin Inc",
        })
    );
});
