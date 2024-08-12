import { Handlers, PageProps } from "$fresh/server.ts";
import { Button } from "$components/Button.tsx";
import { getPasskeysByUserId, Passkey } from "../../db/passkeySchema.ts";
import { SanitizedUser, User } from "../../db/userSchema.ts";
import RegisterPasskey from "../../islands/RegisterPasskey.tsx";
import { PasskeyEditDelete } from "../../islands/PasskeyEditDelete.tsx";
import PasswordPairInputs from "../../islands/PasswordPairInputs.tsx";
import PasswordInput from "../../islands/PasswordInput.tsx";
import { getAESKey } from "../../lib/getKey.ts";
import { createTimeBasedKey } from "../../lib/timeBasedKey.ts";
// import UpdateEmailForm from "../../islands/UpdateEmailForm.tsx";
import UpdateHandleForm from "../../islands/UpdateHandleForm.tsx";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const rawUser = ctx.state.rawUser as User;
    const user = ctx.state.user as SanitizedUser;

    const passkeys = await getPasskeysByUserId(rawUser.id);

    const key = await getAESKey();
    const timeBasedKey = await createTimeBasedKey(key, 300);

    return ctx.render({ user, passkeys, timeBasedKey });
  },
};

interface Props {
  user: SanitizedUser;
  passkeys: Passkey[];
  timeBasedKey: string;
}

export default function Home(props: PageProps<Props>) {
  const { user, passkeys /*, timeBasedKey */} = props.data;

  return (
    <div class="h-screen">
      <h1 class="text-2xl p-8 col-span-2">Account</h1>
      <div class="flex gap-4">
        <div class="shadow-md rounded px-8 py-6">
          <h2 class="text-lg">Passkeys</h2>
          <ul class="flex flex-col gap-2 p-2">
            {passkeys.map((k, i) => (
              <PasskeyEditDelete key={i} id={k.id} nickname={k.nickname} />
            ))}
          </ul>
          <div class="mt-4 flex justify-center">
            <RegisterPasskey />
          </div>
        </div>
        <div class="shadow-md rounded px-8 py-6">
          <h2 class="text-lg">Change Password</h2>
          <form class="flex flex-col">
            <div class="mb-8">
              <label
                for="current-password"
                class="block text-gray-700 text-sm font-bold mb-2"
              >
                Current Password
              </label>
              <PasswordInput
                class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                id="password"
                type="password"
                name="current-password"
                minLength={8}
                maxLength={100}
                required
                autoComplete="current-password"
              />
            </div>
            <PasswordPairInputs />
            <Button type="submit">Update</Button>
          </form>
        </div>
        {
          /* <div class="shadow-md rounded px-8 py-6">
          <h2 class="text-lg">Change Email</h2>
          <UpdateEmailForm user={user} timeBasedKey={timeBasedKey} />
        </div> */
        }
        <div class="shadow-md rounded px-8 py-6">
          <h2 class="text-lg">Change Handle</h2>
          <UpdateHandleForm user={user} />
        </div>
      </div>
    </div>
  );
}
