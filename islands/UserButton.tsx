import { Button } from "$components/Button.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { SanitizedUser } from "../db/userSchema.ts";
import routes from "../routes.ts";
import { useEffect } from "preact/hooks";

interface Props {
    isAuthenticated: boolean;
    user?: SanitizedUser;
}

const userName = signal<string | undefined>(undefined);

export default function UserButton(props: Props) {
    const { isAuthenticated, user } = props;

    const isAuthenticatedSignal = signal<boolean>(isAuthenticated);
    userName.value = user?.handle;

    if (!isAuthenticatedSignal.value) {
        return (
            <Button
                href={routes.login.index}
                class="bg-white focus:bg-gray-100 text-blue-500 py-1 px-2"
            >
                Login
            </Button>
        );
    }

    async function loadUser() {
        if (!userName.value) {
            const resp = await fetch(routes.api.user.index);
            const json = await resp.json();
            userName.value = json.handle;
        }
    }

    async function logout() {
        const resp = await fetch(routes.api.auth.logout, {
            method: "post",
        });
        if (resp.ok) {
            isAuthenticatedSignal.value = false;
            location.href = routes.login.index;
        }
    }

    if (IS_BROWSER) {
        useEffect(() => {
            if (!userName.value) {
                fetch(routes.api.user.index).then((resp) => resp.json()).then(
                    (json) => {
                        userName.value = json.handle;
                    },
                );
            }
        }, [userName]);
    }

    return (
        <div class="user-button relative" onPointerOver={loadUser}>
            <label for="user-menu" class="text-white cursor-pointer">
                {userName}
            </label>
            <input
                id="user-menu"
                type="checkbox"
                class="user-button-checkbox opacity-0"
            />
            <ul class="user-menu absolute top-full end-0 bg-blue-500 py-1 px-2">
                <li class="py-1">
                    <a class="text-white" href={routes.account.index}>
                        Account
                    </a>
                </li>
                <li class="py-1">
                    <button class="text-white" onClick={logout}>Logout</button>
                </li>
            </ul>
        </div>
    );
}
