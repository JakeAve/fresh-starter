import { IS_BROWSER } from "$fresh/runtime.ts";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import PasswordInput from "./PasswordInput.tsx";
import { startAuthentication } from "@simplewebauthn/browser";
import { signal } from "@preact/signals";
import { Button } from "$components/Button.tsx";

const PasskeyIcon = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 216 216"
    style="enable-background:new 0 0 216 216;"
    xml:space="preserve"
    width="32px"
  >
    <g id="Layer_1">
    </g>
    <g id="Isolation_Mode">
      <rect fill="none" width="216" height="216" />
      <g>
        <g>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            fill="#FFFFFF"
            d="M172.32,96.79c0,13.78-8.48,25.5-20.29,29.78l7.14,11.83l-10.57,13l10.57,12.71l-17.04,22.87l-12.01-12.82
       v-25.9v-22.56c-10.68-4.85-18.15-15.97-18.15-28.91c0-17.4,13.51-31.51,30.18-31.51C158.81,65.28,172.32,79.39,172.32,96.79z
        M142.14,101.61c4.02,0,7.28-3.4,7.28-7.6c0-4.2-3.26-7.61-7.28-7.61s-7.28,3.4-7.28,7.61
       C134.85,98.21,138.12,101.61,142.14,101.61z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            fill="#DAD9D9"
            d="M172.41,96.88c0,13.62-8.25,25.23-19.83,29.67l6.58,11.84l-9.73,13l9.73,12.71l-17.03,23.05v-25.9v-32.77
       v-26.87c4.02,0,7.28-3.41,7.28-7.6c0-4.2-3.26-7.61-7.28-7.61V65.28C158.86,65.28,172.41,79.43,172.41,96.88z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            fill="#FFFFFF"
            d="M120.24,131.43c-9.75-8-16.3-20.3-17.2-34.27H50.8c-10.96,0-19.84,9.01-19.84,20.13v25.17
       c0,5.56,4.44,10.07,9.92,10.07h69.44c5.48,0,9.92-4.51,9.92-10.07V131.43z"
          />
          <path
            fill="#FFFFFF"
            d="M73.16,91.13c-2.42-0.46-4.82-0.89-7.11-1.86C57.4,85.64,52.36,78.95,50.73,69.5
       c-1.12-6.47-0.59-12.87,2.03-18.92c3.72-8.6,10.39-13.26,19.15-14.84c5.24-0.94,10.46-0.73,15.5,1.15
       c7.59,2.82,12.68,8.26,15.03,16.24c2.38,8.05,2.03,16.1-1.56,23.72c-3.72,7.96-10.21,12.23-18.42,13.9
       c-0.68,0.14-1.37,0.27-2.05,0.41C78,91.13,75.58,91.13,73.16,91.13z"
          />
        </g>
      </g>
    </g>
  </svg>
);

interface LoginProps {
  email?: string;
  message?: string;
}

const loginToken = signal("");

export default function LoginForm(props: LoginProps) {
  const { email, message } = props;
  if (!IS_BROWSER) return <div></div>;

  async function authenticateWithPasskey() {
    const optionsResp = await fetch("/api/generate-authentication-options", {
      method: "post",
    });

    const { options, sessionId } = await optionsResp.json() as {
      options: PublicKeyCredentialRequestOptionsJSON;
      sessionId: string;
    };

    options.userVerification = "required";

    // @ts-ignore just let it go
    options.mediation = "required";

    if (!options) {
      alert("Error getting passkey");
      return;
    }

    let verifyPayload;

    try {
      verifyPayload = await startAuthentication(options, false);
    } catch (err) {
      console.error(err);
      alert("could not assess response");
    }

    const verificationResp = await fetch("/api/verify-authentication", {
      method: "post",
      body: JSON.stringify({ verifyPayload, sessionId }),
    });

    const verification = await verificationResp.json() as { token: string };

    if (verificationResp.ok) {
      loginToken.value = verification.token;

      // let the signal propagate
      setTimeout(() => {
        const form = document.querySelector(
          "#login-with-passkey",
        ) as HTMLFormElement;
        form.submit();
      });
    }
  }
  return (
    <div class="w-full max-w-xs">
      <div class="shadow-md rounded px-8 py-6 mb-4">
        <form class="flex justify-center" method="post" id="login-with-passkey">
          <Button
            class="flex items-center"
            type="button"
            onClick={authenticateWithPasskey}
          >
            <PasskeyIcon />
            Login with Passkey
          </Button>
          <input
            type="hidden"
            id="login-token"
            name="login-token"
            value={loginToken.value}
          />
        </form>
        <hr class="my-8" />
        <form method="post">
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
              value={email || ""}
              required
              autocomplete="username"
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
            <Button type="submit" id="login-submit">Login with Password</Button>
            <a
              class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <hr class="my-8" />
        <div class="flex items-center flex-col">
          <a
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/signup"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
