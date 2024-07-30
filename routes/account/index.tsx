import { Handlers, PageProps } from "$fresh/server.ts";
import { Button } from "$components/Button.tsx";
import { getPasskeysByUserId, Passkey } from "../../db/passkeySchema.ts";
import { SanitizedUser, User } from "../../db/userSchema.ts";
import RegisterPasskey from "../../islands/RegisterPasskey.tsx";
import { PasskeyEditDelete } from "../../islands/PasskeyEditDelete.tsx";
import routes from "../../routes.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const rawUser = ctx.state.rawUser as User;
    const user = ctx.state.user as SanitizedUser;

    const passkeys = await getPasskeysByUserId(rawUser.id);

    return ctx.render({ user, passkeys });
  },
};

interface Props {
  user: SanitizedUser;
  passkeys: Passkey[];
}

export default function Home(props: PageProps<Props>) {
  const { user, passkeys } = props.data;

  return (
    <div class="grid place-items-center h-screen">
      <h1>Account</h1>
      <h2>Welcome, {user.name}</h2>
      <h2>Passkeys</h2>
      <ul class="flex flex-col gap-2">
        {passkeys.map((k, i) => (
          <PasskeyEditDelete key={i} id={k.id} nickname={k.nickname} />
        ))}
      </ul>
      <RegisterPasskey />
      <form method="post" action={routes.api.auth.logout}>
        <Button>Logout</Button>
      </form>
    </div>
  );
}
