import { DeleteIcon } from "$components/deleteIcon.tsx";
import { Button } from "$components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";

interface Props {
    nickname: string;
    id: string;
}

export function PasskeyEditDelete(props: Props) {
    const { nickname, id } = props;

    if (!IS_BROWSER) return <li>{nickname}</li>;

    async function deleteKey() {
        const confirmation = confirm(
            "You will no longer be able to sign in with this passkey. Would you like to proceed?",
        );
        if (confirmation) {
            const resp = await fetch("/api/user/passkey/delete", {
                method: "post",
                body: JSON.stringify({ passkeyId: id }),
            });
            const json = await resp.json();
            alert(json.message);
            location.reload();
        }
    }
    return (
        <li class="flex items-center gap-2 justify-between">
            {nickname}
            <Button
                onClick={deleteKey}
                class="bg-red-500 hover:bg-red-700 p-1"
                aria-label="Delete"
            >
                <DeleteIcon />
            </Button>
        </li>
    );
}
