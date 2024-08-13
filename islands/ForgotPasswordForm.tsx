import { Button } from "$components/Button.tsx";
import {signal} from "@preact/signals"
import { IS_BROWSER } from "$fresh/runtime.ts";

interface Props {
    email?: string;
}

const emailSignal = signal('')

export default function ForgotPasswordForm(props: Props) {
    const {email} = props;

    if (email) {
        emailSignal.value = email;
    }

    if (IS_BROWSER) {
        const url = new URL(location.href);

        if (url.hash.length > 1) {
            emailSignal.value = url.hash.slice(1)
            history.pushState(null, '', '#');
        }
    }

    return (
        <form
            class="flex flex-col shadow-md rounded px-8 py-6"
            method="post"
        >
            <p class="mb-2">
                If the email is in our system, we will send a recovery code.
            </p>
            <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="email"
            >
                Email
            </label>
            <input
                id="email"
                name="email"
                type="email"
                value={emailSignal}
                class="shadow appearance-none border rounded mb-4 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <Button>Send Recovery Code</Button>
        </form>
    );
}
