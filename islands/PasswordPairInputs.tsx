import { computed, signal } from "@preact/signals";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator.tsx";
import PasswordInput from "./PasswordInput.tsx";

const password = signal("");
const repeatPassword = signal("");

const doPasswordsMatch = computed(() =>
  password.value === repeatPassword.value
);

export default function PasswordPairInputs() {
  return (
    <>
      <div class="mb-6">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="password"
        >
          Password
        </label>
        <PasswordStrengthIndicator
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          type="password"
          name="password"
          placeholder=""
          password={password}
          autoComplete="new-password"
        />
      </div>
      <div class="mb-6">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="repeat-password"
        >
          Repeat Password
        </label>
        <PasswordInput
          class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
            doPasswordsMatch.value ? "" : "border-red-500"
          }`}
          id="repeat-password"
          type="password"
          placeholder=""
          onInput={(evt) => {
            repeatPassword.value = evt.currentTarget.value;
          }}
          value={repeatPassword}
          autoComplete="new-password"
        />
        <p class="text-red-500 text-xs italic">
          &nbsp;
          {!doPasswordsMatch.value && "Make sure passwords match"}
        </p>
      </div>
    </>
  );
}
