import { SignUp } from "../../components/Signup.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { addUser, DuplicateError } from "../../db/userSchema.ts";
import { getAESKey } from "../../lib/getKey.ts";
import {
  createTimeBasedKey,
  verifyTimeBasedKey,
} from "../../lib/timeBasedKey.ts";
import { checkPasswordStrength } from "../../lib/passwordStrength.ts";
import { validateEmail } from "../../lib/validators/validateEmail.ts";
import { validateHandle } from "../../lib/validators/validateHandle.ts";
import { ValidationError } from "../../Errors/ValidationError.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const key = await getAESKey();
    const timeBasedKey = await createTimeBasedKey(key, 120);
    const resp = await ctx.render({ timeBasedKey });
    resp.headers.set("X-Custom-Header", "Hello");
    return resp;
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString() as string;
    const name = form.get("name")?.toString() as string;
    const handle = form.get("handle")?.toString() as string;
    const password = form.get("password")?.toString() as string;
    const repeatPassword = form.get("repeat-password")?.toString() as string;
    const apiKey = form.get("api-key")?.toString() as string;

    try {
      const key = await getAESKey();

      await Promise.all([
        verifyTimeBasedKey(key, apiKey),
        checkPasswordStrength(password),
        validateEmail(email),
        validateHandle(handle),
        function () {
          if (password !== repeatPassword) {
            throw new ValidationError("Passwords must match.");
          }
        }(),
      ]);
      await addUser({ email, name, handle, password });
    } catch (err) {
      if (err instanceof ValidationError || err instanceof DuplicateError) {
        return ctx.render({ message: err.message });
      }
      console.error(err);
      return ctx.render({ message: "Could not save user" });
    }

    const headers = new Headers();
    headers.set("location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

interface Props {
  message: string;
  timeBasedKey: string;
}

export default function Home(props: PageProps<Props>) {
  const message = props.data?.message;
  const timeBasedKey = props?.data.timeBasedKey;

  return (
    <div class="grid place-items-center h-screen">
      {message && <span>{message}</span>}
      <SignUp timeBasedKey={timeBasedKey} />
    </div>
  );
}
