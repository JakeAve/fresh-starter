import { signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";

interface HandleInputProps extends JSX.HTMLAttributes<HTMLInputElement> {
}

const isAvailable = signal(true);
const handle = signal("");
const displayMessage = signal("Handle cannot be blank.");

export default function HandleInput(props: HandleInputProps) {
  async function updateInput(
    evt: JSX.TargetedInputEvent<HTMLInputElement>,
  ) {
    handle.value = evt.currentTarget.value;

    const resp = await fetch("/api/handle-availability", {
      method: "POST",
      body: JSON.stringify({ handle: evt.currentTarget.value }),
    });
    if (resp.ok) {
      isAvailable.value = true;
    } else {
      isAvailable.value = false;
    }
    const json = await resp.json();
    if (json.message) {
      displayMessage.value = json.message;
    }
  }

  return (
    <>
      <div class="relative">
        <span class="absolute start-2 top-2">@</span>
        <input
          {...props}
          onInput={updateInput}
          class={`ps-6 ${isAvailable.value ? "" : "border-red-500"} ` + props.class}
        />
      </div>
      <p class={`text-sm my-2 ${isAvailable.value ? "text-black" : "text-red-500"}`}>
        {displayMessage.value}
      </p>
    </>
  );
}
