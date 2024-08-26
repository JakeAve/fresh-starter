import { PageProps } from "$fresh/server.ts";
import { SanitizedUser } from "$kv/userSchema.ts"
import UserButton from "../islands/UserDropDown.tsx";
import routes from "../routes.ts";

export default function Layout({ Component, state }: PageProps) {
  return (
    <>
      <header class="bg-blue-500 px-4 xl:px-6 py-2 flex justify-between items-center sticky top-0 z-10">
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
