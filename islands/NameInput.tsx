import { signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import routes from "../routes.ts";

interface NameInputProps extends JSX.HTMLAttributes<HTMLInputElement> {
    displayMessage?: string;
}

const name = signal("");
const displayMessage = signal("");
const isValid = signal(true);

export default function HandleInput(props: NameInputProps) {
    const { displayMessage: propsDisplayMessage } = props;

    if (propsDisplayMessage) {
        displayMessage.value = propsDisplayMessage;
    }

    async function updateInput(
        evt: JSX.TargetedInputEvent<HTMLInputElement>,
    ) {
        name.value = evt.currentTarget.value;

        const resp = await fetch(routes.api.validate.name, {
            method: "post",
            body: JSON.stringify({ name: evt.currentTarget.value }),
        });
        if (resp.ok) {
            isValid.value = true;
            displayMessage.value = ''
        } else {
            isValid.value = false;
        }
        const json = await resp.json();
        if (json.message) {
            displayMessage.value = json.message;
        }
    }

    return (
        <>
            <div>
                <input
                    {...props}
                    onInput={updateInput}
                    class={`${isValid.value ? "" : "border-red-500"} ` +
                        props.class}
                />
            </div>
            {(displayMessage.value && (
                <p
                    class={`text-sm my-2 ${
                        isValid.value ? "text-black" : "text-red-500"
                    }`}
                >
                    {displayMessage.value}
                </p>
            )) || <>&nbsp;</>}
        </>
    );
}
