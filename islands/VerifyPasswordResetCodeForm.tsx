import { Button } from "$components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import routes from "../routes.ts";
import { useRef } from "preact/hooks";

interface Props {
    email?: string;
}

const tokenSignal = signal("");
const isSubmitting = signal(false);

export default function ResetPasswordForm(props: Props) {
    const { email } = props;

    const resetCodeRef = useRef<HTMLInputElement | null>(null);
    const mainFormRef = useRef<HTMLFormElement | null>(null);

    if (IS_BROWSER) {
        const url = new URL(location.href);

        if (url.hash.length > 1) {
            tokenSignal.value = url.hash.slice(1);
        }

        setTimeout(() => {
            if (resetCodeRef.current?.value) {
                mainFormRef.current?.submit();
            }
        });
    }

    return (
        <div class="shadow-md rounded px-8 py-6">
            <p class="mb-2">
                Enter the code we sent to your email. Your code will expire
                in 15 minutes.
            </p>
            <form
                class="mb-2 flex justify-center"
                method="post"
                href={routes["forgot-password"].index}
            >
                <Button>Resend Email</Button>
                <input hidden value={email} />
            </form>
            <form
                ref={mainFormRef}
                class="flex flex-col"
                method="post"
                disabled={isSubmitting}
            >
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="reset-code"
                >
                    Reset Code
                </label>
                <input
                    ref={resetCodeRef}
                    id="reset-code"
                    name="reset-code"
                    type="text"
                    value={tokenSignal}
                    pattern="\d{6,6}"
                    required
                    class="text-center shadow appearance-none border rounded mb-4 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <Button onClick={() => isSubmitting.value = true}>Confirm Code</Button>
            </form>
        </div>
    );
}
