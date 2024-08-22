import { PageProps } from "$fresh/server.ts";
import { SanitizedUser } from "../db/userSchema.ts";
import UserButton from "../islands/UserButton.tsx";
import routes from "../routes.ts";

export default function Layout({ Component, state }: PageProps) {
  return (
    <>
      <header class="bg-blue-500 px-4 py-2 flex justify-between items-center">
        <a href={routes.index}>
          <h1 class="text-white font-medium">Passkey-Setup</h1>
        </a>
        <UserButton
          isAuthenticated={state.isAuthenticated as boolean}
          user={state.user as SanitizedUser}
        />
      </header>
      <Component />
      <footer></footer>
    </>
  );
}
