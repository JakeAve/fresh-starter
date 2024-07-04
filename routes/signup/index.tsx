import { Signup } from "../../components/Signup.tsx";

import { Handlers, PageProps } from "$fresh/server.ts";
import { addUser, getAllUsers } from "../../db/userSchema.ts";
import { getKey } from "../../lib/getKey.ts";
import { createTimeBasedKey } from "../../lib/timeBasedKey.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const key = await getKey()
    const timeBasedKey = await createTimeBasedKey(key, 3600);
    const resp = await ctx.render({ timeBasedKey });
    resp.headers.set("X-Custom-Header", "Hello");
    const foo = await getAllUsers();

    console.log("All users", foo);
    return resp;
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const name = form.get("name")?.toString();
    const handle = form.get("handle")?.toString();
    const password = form.get("password")?.toString();
    const apiKey = form.get("api-key")?.toString();
    
    if (!email || !name || !handle || !password) {
      return ctx.render({ message: "bad stuff" });
    }
    try {
      await addUser({ email, name, handle, password });
    } catch (err) {
      if (err instanceof TypeError) {
        return ctx.render({ message: "User already exists" });
      }
    }
    return ctx.render({ message: "User saved!" });
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
      <Signup timeBasedKey={timeBasedKey} />
    </div>
  );
}
