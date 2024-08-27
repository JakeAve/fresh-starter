import { Button } from "$components/Button.tsx";
import routes from "../routes.ts";
import { signal } from "@preact/signals";

const displayMessage = signal("");
const didSubmitSuccessfully = signal(false);
const isError = signal(false);

export default function ResendEmailVerificationForm() {
  async function resendVerificationEmail(e: SubmitEvent) {
    e.preventDefault();

    const resp = await fetch(routes["verify-email"].index, {
      method: "post",
    });

    const json = await resp.json();

    displayMessage.value = json.message;

    if (resp.ok) {
      isError.value = false;
      didSubmitSuccessfully.value = true;
    } else {
      isError.value = true;
    }
  }

  return (
    <form disabled={didSubmitSuccessfully} onSubmit={resendVerificationEmail}>
      {!didSubmitSuccessfully.value && (
        <>
          <p class="mt-2">You can send another verification email here:</p>
          <Button class="mt-2">Send</Button>
        </>
      )}
      <p class={`mt-2 ${isError.value ? "text-red-500" : ""}`}>
        {displayMessage}
      </p>
    </form>
  );
}
