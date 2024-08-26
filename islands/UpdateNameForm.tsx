import { Button } from "$components/Button.tsx";
import { SanitizedUser } from "$kv/userSchema.ts";
import routes from "../routes.ts";
import { signal } from "@preact/signals";
import NameInput from "./NameInput.tsx";

interface Props {
  user: SanitizedUser;
}

const responseMessage = signal("");
const responseStatus = signal("text-black");
const currentName = signal("");

export default function UpdateHandleForm(props: Props) {
  const { user } = props;

  if (!currentName.value) {
    currentName.value = user.name;
  }

  async function updateName(e: SubmitEvent) {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest(
      "form",
    ) as HTMLFormElement;
    const data = new FormData(form);
    const name = data.get("name");

    const resp = await fetch(routes.api.user.name, {
      method: "put",
      body: JSON.stringify({ name }),
    });
    const json = await resp.json();
    if (!resp.ok) {
      responseMessage.value = json.message;
      responseStatus.value = "text-red-500";
    } else {
      currentName.value = name as string;
      responseMessage.value = `Name updated to ${name}`;
      responseStatus.value = "text-black";
      form.reset();
    }
  }
  return (
    <form class="flex flex-col gap-2" onSubmit={updateName}>
      <label
        for="current-name"
        class="block text-gray-700 text-sm font-bold mb-2"
      >
        Current Name
      </label>
      <input
        readonly
        class="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-200 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        id="current-name"
        value={currentName}
      />
      <label
        for="name"
        class="block text-gray-700 text-sm font-bold mb-2"
      >
        Name
      </label>
      <NameInput
        id="name"
        name="name"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
      />
      <Button type="submit">Update</Button>
      <p class={`my-2 text-center ${responseStatus}`}>
        {responseMessage}
      </p>
    </form>
  );
}
