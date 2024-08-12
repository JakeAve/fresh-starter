import { Button } from "$components/Button.tsx";
import { SanitizedUser } from "../db/userSchema.ts";
import routes from "../routes.ts";
import { signal } from "@preact/signals";
import HandleInput from "./HandleInput.tsx";

interface Props {
    user: SanitizedUser;
}

const displayMessage = signal('');

export default function UpdateHandleForm(props: Props) {
    const { user } = props;
    
    const currentHandle = signal(user.handle);

    async function updateHandle(e: SubmitEvent) {
        e.preventDefault();
        const form = (e.target as HTMLElement).closest(
            "form",
        ) as HTMLFormElement;
        const data = new FormData(form);
        const handle = data.get('handle');

        const resp = await fetch(routes.api.user.handle, {method: 'put', body: JSON.stringify({handle})})
        const json = await resp.json();
        if (!resp.ok) {
            displayMessage.value = json.message;
        } else {
            location.reload();
        }
    }
    return (
        <form class="flex flex-col gap-2" onSubmit={updateHandle}>
        <label
          for="current-email"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Current Handle
        </label>
        <input
          readonly
          class="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-200 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          id="current-handle"
          value={"@" + currentHandle}
        />
        <label
          for="handle"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Handle
        </label>
        <HandleInput
          id="handle"
          name="handle"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
        />
        <Button type="submit">Update</Button>
      </form>
    );
}
