import { Button } from "$components/Button.tsx";
import routes from "../routes.ts";
import { signal } from "@preact/signals";
import PasswordInput from "./PasswordInput.tsx";
import PasswordPairInputs from "./PasswordPairInputs.tsx";

const displayMessage = signal("Successfully updated password");
const didUpdate = signal(false);

export default function UpdatePasswordForm() {
    async function updatePassword(e: SubmitEvent) {
        e.preventDefault();
        const form = (e.target as HTMLElement).closest(
            "form",
        ) as HTMLFormElement;
        const data = new FormData(form);
        const currentPassword = data.get("current-password");
        const password = data.get("password");
        const repeatPassword = data.get("repeat-password");

        const resp = await fetch(routes.api.user.password, {
            method: "put",
            body: JSON.stringify({ currentPassword, password, repeatPassword }),
        });
        const json = await resp.json();
        if (!resp.ok) {
            displayMessage.value = json.message;
        } else {
            didUpdate.value = true;
            displayMessage.value = "Successfully updated password";
            form.reset();
        }
    }

    return (
        <form class="flex flex-col" onSubmit={updatePassword}>
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
                    disabled={didUpdate.value}
                />
            </div>
            <PasswordPairInputs disabled={didUpdate.value} />
            <Button type="submit">Update</Button>
            {didUpdate.value && <p class="my-2 text-center">{displayMessage}</p>}
        </form>
    );
}
