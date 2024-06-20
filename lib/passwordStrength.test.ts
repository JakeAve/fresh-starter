import { assert, assertEquals } from "$std/assert/mod.ts";
import {
  checkPasswordStrength,
  hasLowercase,
  hasNumber,
  hasSpecialChar,
  hasUppercase,
  minLength,
  PasswordStrength,
} from "./passwordStrength.ts";

Deno.test("hasLowercase()", () => {
  assert(hasLowercase("foo"));
  assertEquals(hasLowercase("FOO"), false);
});

Deno.test("hasUppercase()", () => {
  assert(hasUppercase("FOO"));
  assertEquals(hasUppercase("foo"), false);
});

Deno.test("hasNumber()", () => {
  assert(hasNumber("f1f2"));
  assertEquals(hasNumber("ffff"), false);
});

Deno.test("hasSpecialChar()", () => {
  assert(hasSpecialChar("f$$"));
  assertEquals(hasSpecialChar("foo"), false);
});

Deno.test("hasSpecialChar() includes characters with accents", () => {
  assert(hasSpecialChar("föø"));
});

Deno.test("minLength() works", () => {
  const m = minLength(8);
  assert(m("12345678"));
  assertEquals(m("1234567"), false);
});

Deno.test("checkPasswordStrength() violation of default minlength throws", async () => {
  try {
    await checkPasswordStrength("hello");
  } catch (err) {
    assertEquals(err.responseBody, {
      hasLowercase: true,
      hasUppercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      hasMinLength: false,
    });
  }
});

Deno.test("checkPasswordStrength() default minlength and lowercase passes, does not throw", async () => {
  const strength = await checkPasswordStrength("helloooo");
  assertEquals(strength, {
    hasLowercase: true,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: true,
  });
});

Deno.test("checkPasswordStrength() strong password passes", async () => {
  const strength = await checkPasswordStrength("1H3Llö!:)");
  assertEquals(strength, {
    hasLowercase: true,
    hasUppercase: true,
    hasNumber: true,
    hasSpecialChar: true,
    hasMinLength: true,
  });
});

Deno.test("checkPasswordStrength() validations are granular", async () => {
  const validations = [
    {
      message: "password much have at least one lowercase letter",
      name: "hasLowercase" as keyof PasswordStrength,
      required: true,
      callback: hasLowercase,
    },
    {
      message: "password much have at least one uppercase letter",
      name: "hasUppercase" as keyof PasswordStrength,
      required: true,
      callback: hasUppercase,
    },
    {
      message: "password much have at least one number",
      name: "hasNumber" as keyof PasswordStrength,
      required: true,
      callback: hasNumber,
    },
    {
      message:
        "password much have at least one special character (!@#$%^&*()_+{}|:<>?)",
      name: "hasSpecialChar" as keyof PasswordStrength,
      required: true,
      callback: hasSpecialChar,
    },
    {
      message: "password must be at least 8 characters",
      name: "hasMinLength" as keyof PasswordStrength,
      required: true,
      callback: minLength(10),
    },
  ];

  for (const val of validations) {
    const strength = await checkPasswordStrength("1H3Llö!:)there", undefined, [
      val,
    ]);

    assert(strength[val.name]);

    try {
      await checkPasswordStrength("", undefined, [val]);
    } catch (err) {
      assertEquals(err.responseBody[val.name], false);
    }
  }
});
