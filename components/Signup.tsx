import PasswordPairInputs from "../islands/PasswordPairInputs.tsx";
import HandleInput from "../islands/HandleInput.tsx";
import EmailInput from "../islands/EmailInput.tsx";

interface Props {
  timeBasedKey: string;
}

export function SignUp(props: Props) {
  const { timeBasedKey } = props;

  return (
    <div class="w-full max-w-xs">
      <form
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        method="post"
      >
        <input name="api-key" type="hidden" readOnly required value={timeBasedKey} />
        <div class="mb-2">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="email"
          >
            Email
          </label>
          <EmailInput
            autoComplete="email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            placeholder="Email"
            required
            timeBasedKey={timeBasedKey}
            type="email"
          />
        </div>
        <div class="mb-8">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="name"
          >
            Name
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            maxLength={50}
            minLength={2}
            name="name"
            placeholder="Name"
            required
            type="text"
          />
        </div>
        <div class="mb-2">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="handle"
          >
            Handle
          </label>
          <HandleInput
            autoComplete="off"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="handle"
            maxLength={30}
            minLength={3}
            name="handle"
            placeholder="handle"
            required
            type="text"
          />
        </div>
        <PasswordPairInputs />
        <div class="flex items-center flex-col gap-4">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign Up
          </button>
          <a
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="/"
          >
            Already have an account?
          </a>
        </div>
      </form>
    </div>
  );
}
