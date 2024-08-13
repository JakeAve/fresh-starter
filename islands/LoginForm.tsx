import { IS_BROWSER } from "$fresh/runtime.ts";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";
import PasswordInput from "./PasswordInput.tsx";
import { startAuthentication } from "@simplewebauthn/browser";
import { signal } from "@preact/signals";
import { Button } from "$components/Button.tsx";
import { PasskeyIcon } from "$components/PasskeyIcon.tsx";
import routes from "../routes.ts";

interface LoginProps {
  email?: string;
  message?: string;
}

const loginToken = signal("");

export default function LoginForm(props: LoginProps) {
  const { email, message } = props;
  if (!IS_BROWSER) return <div></div>;

  async function authenticateWithPasskey() {
    const optionsResp = await fetch(
      routes.api.auth["generate-authentication-options"],
      {
        method: "post",
      },
    );

    const { options, sessionId } = await optionsResp.json() as {
      options: PublicKeyCredentialRequestOptionsJSON;
      sessionId: string;
    };

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

    const verificationResp = await fetch(
      routes.api.auth["verify-authentication"],
      {
        method: "post",
        body: JSON.stringify({ verifyPayload, sessionId }),
      },
    );

    if (!verificationResp.ok) {
      alert(
        "Verification failed. Make sure your biometric device (fingerprint reader / face id) is available. You can try signing in with your password instead.",
      );
      return;
    }

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
              href={routes["forgot-password"].index + "#" + (email || "")}
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <hr class="my-8" />
        <div class="flex items-center flex-col">
          <a
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href={routes.signup.index}
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
