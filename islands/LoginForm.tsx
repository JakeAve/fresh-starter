import PasswordInput from "./PasswordInput.tsx";

interface LoginProps {
    email?: string;
    message?: string;
}

export default function LoginForm(props: LoginProps) {
    const { email, message } = props;
    return (
        <div class="w-full max-w-xs">
            <form
                class="bg-white shadow-md rounded px-8 py-6 mb-4"
                method="post"
            >
                <div class="mb-8">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="email"
                    >
                        Email
                    </label>
                    <input
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email || ""}
                        required
                    />
                </div>
                <div class="mb-2">
                    <label
                        class="block text-gray-700 text-sm font-bold mb-2"
                        for="password"
                    >
                        Password
                    </label>
                    <PasswordInput
                        class={`${
                            email ? "border-red-500 " : ""
                        }shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline`}
                        id="password"
                        type="password"
                        name="password"
                        minLength={8}
                        maxLength={100}
                        required
                        autoComplete="current-password"
                    />
                    <p class="text-red-500 text-xs italic">
                        {message || <>&nbsp;</>}
                    </p>
                </div>
                <div class="flex items-center flex-col gap-4">
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Sign In
                    </button>
                    <a
                        class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        href="#"
                    >
                        Forgot Password?
                    </a>
                    <a
                        class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        href="/signup"
                    >
                        Create Account
                    </a>
                </div>
            </form>
        </div>
    );
}
