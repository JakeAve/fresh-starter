import { type Signal, signal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import PasswordInput from "./PasswordInput.tsx";
import { PasswordStrength } from "../lib/passwordStrength.ts";

interface PasswordStrengthIndicatorProps
  extends JSX.HTMLAttributes<HTMLInputElement> {
    password: Signal<string>
}

const displayMessage = signal("");
const strengthScore = signal(0);
const passwordStrength = signal<PasswordStrength>({});

function calcScore(passwordStrength: PasswordStrength) {
  let score = 0;
  for (const key in passwordStrength) {
    if (passwordStrength[key as keyof PasswordStrength] === true) {
      score += 1;
    }
  }

  return score;
}

export default function PasswordStrengthIndicator(
  props: PasswordStrengthIndicatorProps,
) {
  const { password, ...rest } = props;

  async function updateInput(
    evt: JSX.TargetedInputEvent<HTMLInputElement>,
  ) {
    password.value = evt.currentTarget.value;

    const resp = await fetch("/api/password-strength", {
      method: "POST",
      body: JSON.stringify({ password: evt.currentTarget.value }),
    });
    const json = await resp.json();
    if (!json.message) {
      strengthScore.value = calcScore(json);
      displayMessage.value = "";
    } else {
      strengthScore.value = 0;
      displayMessage.value = json.message;
    }
    passwordStrength.value = json;
  }

  return (
    <>
      <PasswordInput
        {...rest}
        value={password}
        onInput={updateInput}
        class={displayMessage.value
          ? rest.class + " border-red-500"
          : rest.class}
      />
      <div class="flex gap-1">
        {Array(strengthScore.value).fill(0).map((_, i, arr) => (
          <div
            key={i}
            class={`w-1/5 h-2 ${
              arr.length < 2
                ? "bg-red-500"
                : arr.length < 4
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
          >
          </div>
        ))}
      </div>
      <p class="text-red-500 text-xs italic">{displayMessage.value}</p>
      <ul class="mt-2">
        <li class="text-sm">
          {passwordStrength.value.hasMinLength ? "✅" : "❌"}{" "}
          Has at least 8 characters
        </li>
        <li class="text-sm mt-1">
          {passwordStrength.value.hasLowercase ? "✅" : "❌"}{" "}
          Has at least 1 lowercase letter
        </li>
        <li class="text-sm mt-1">
          {passwordStrength.value.hasUppercase ? "✅" : "❌"}{" "}
          Has at least 1 uppercase letter
        </li>
        <li class="text-sm mt-1">
          {passwordStrength.value.hasNumber ? "✅" : "❌"} Has at least 1 number
        </li>
        <li class="text-sm mt-1">
          {passwordStrength.value.hasSpecialChar ? "✅" : "❌"}{" "}
          Has at least 1 special character
        </li>
      </ul>
    </>
  );
}
