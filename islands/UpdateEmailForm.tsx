import { Button } from "$components/Button.tsx";
import { SanitizedUser } from "$kv/userSchema.ts";
import routes from "../routes.ts";
import EmailInput from "./EmailInput.tsx";
import { signal } from "@preact/signals";

interface Props {
  timeBasedKey: string;
  user: SanitizedUser;
}

const displayMessage = signal("");

export default function UpdateEmailForm(props: Props) {
  const { user, timeBasedKey } = props;
  async function updateEmail(e: SubmitEvent) {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest(
      "form",
    ) as HTMLFormElement;
    const data = new FormData(form);
    const email = data.get("email");

    const resp = await fetch(routes.api.user.email, {
      method: "put",
      body: JSON.stringify({ email }),
    });
    const json = await resp.json();
    if (!resp.ok) {
      displayMessage.value = json.message;
    } else {
      location.reload();
    }
  }
  return (
    <form class="flex flex-col gap-2" onSubmit={updateEmail}>
      <label
        for="current-email"
        class="block text-gray-700 text-sm font-bold mb-2"
      >
        Current Email
      </label>
      <input
        readonly
        class="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-200 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="email"
        id="current-email"
        value={user.email}
      />
      <label
        for="email"
        class="block text-gray-700 text-sm font-bold mb-2"
      >
        Email
      </label>
      <EmailInput
        autoComplete="email"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="email"
        name="email"
        placeholder="Email"
        required
        timeBasedKey={timeBasedKey}
        type="email"
      />
      <Button type="submit">Update</Button>
      <p class="text-red-500">{displayMessage}</p>
    </form>
  );
}
