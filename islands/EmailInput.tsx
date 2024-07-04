import { signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";

interface EmailInputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  timeBasedKey: string;
}

const isAvailable = signal(true);
const email = signal("");
const displayMessage = signal("");
const didMakeInvalidSubmission = signal(false);

export default function EmailInput(props: EmailInputProps) {
  const { timeBasedKey } = props;

  async function updateInput(
    evt: JSX.TargetedInputEvent<HTMLInputElement>,
  ) {
    email.value = evt.currentTarget.value;

    const resp = await fetch("/api/email-availability", {
      method: "POST",
      body: JSON.stringify({
        email: evt.currentTarget.value,
        token: timeBasedKey,
      }),
    });
    if (resp.ok) {
      isAvailable.value = true;
    } else {
      isAvailable.value = false;
      didMakeInvalidSubmission.value = true;
    }
    const json = await resp.json();
    if (json.message) {
      displayMessage.value = json.message;
    } else {
      displayMessage.value = "";
    }
  }

  return (
    <>
      <div>
        <input
          {...props}
          onChange={updateInput}
          onInput={(e) => {
            if (didMakeInvalidSubmission) {
              updateInput(e);
            }
          }}
          class={`${isAvailable.value ? "" : "border-red-500"} ` +
            props.class}
        />
      </div>
      <p
        class={`text-sm my-2 ${
          isAvailable.value ? "text-black" : "text-red-500"
        }`}
      >
        {displayMessage.value}
      </p>
    </>
  );
}
