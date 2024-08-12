import { computed, signal } from "@preact/signals";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator.tsx";
import PasswordInput from "./PasswordInput.tsx";

interface Props {
  disabled?: boolean;
}

const password = signal("");
const repeatPassword = signal("");

const doPasswordsMatch = computed(() =>
  password.value === repeatPassword.value
);

export default function PasswordPairInputs(props: Props) {
  const { disabled = false } = props;
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
          autoComplete="new-password"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          id="password"
          maxLength={100}
          minLength={8}
          name="password"
          password={password}
          placeholder=""
          required
          type="password"
          disabled={disabled}
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
          autoComplete="new-password"
          class={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
            doPasswordsMatch.value ? "" : "border-red-500"
          }`}
          id="repeat-password"
          onInput={(evt) => {
            repeatPassword.value = evt.currentTarget.value;
          }}
          minLength={8}
          maxLength={100}
          name="repeat-password"
          placeholder=""
          required
          type="password"
          value={repeatPassword}
          disabled={disabled}
        />
        <p class="text-red-500 text-xs italic">
          &nbsp;
          {!doPasswordsMatch.value && "Make sure passwords match"}
        </p>
      </div>
    </>
  );
}
