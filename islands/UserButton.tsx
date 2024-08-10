import { Button } from "$components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { SanitizedUser } from "../db/userSchema.ts";
import routes from "../routes.ts";

interface Props {
    isAuthenticated: boolean;
    user?: SanitizedUser;
}

const userData = signal<SanitizedUser | null>(null);

export default function UserButton(props: Props) {
    const { isAuthenticated, user } = props;

    if (!isAuthenticated) {
        return (
            <Button
                href="/login"
                class="bg-white focus:bg-gray-100 text-blue-500 py-1 px-2"
            >
                Login
            </Button>
        );
    }

    async function loadUser() {
        if (!user && !userData.value) {
            const resp = await fetch(routes.api.user.index);
            const json = await resp.json();
            userData.value = json;
        } else {
            userData.value = user as SanitizedUser;
        }
    }

    

    if (IS_BROWSER) {
        if (userData.value) {
            console.log(userData.value)
        }
    }

    return (
        <div onPointerOver={loadUser} onPointerDown={loadUser}>
            <button></button>
            <button>Logout</button>
        </div>
    );
}
