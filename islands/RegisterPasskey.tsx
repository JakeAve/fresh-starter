import { startRegistration } from "@simplewebauthn/browser";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { RegistrationResponseJSON } from "@simplewebauthn/types";

export default function RegisterPasskey() {
  if (!IS_BROWSER) return <button disabled>Add New Passkey</button>;

  async function register() {
    const regReq = await fetch("/api/user/passkey/register-request", {
      method: "post",
    });

    const options = await regReq.json();

    let regResp: RegistrationResponseJSON | undefined;

    try {
      regResp = await startRegistration(options);
    } catch (err) {
      if (err.name === "InvalidStateError") {
        throw new Error(
          "Your authenticator was probably already registered.",
        );
      }
      console.error(err);
      alert("Error registering key");
    }

    const verificationResp = await fetch(
      "/api/user/passkey/verify-registration",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(regResp),
      },
    );

    const verification = await verificationResp.json();

    if (verification && verification.verified) {
      alert(`Passkey saved as ${verification.nickname}`);
      location.reload();
    } else {
      alert(verification.message);
    }
  }

  return (
    <>
      <button onClick={register}>Create New Passkey</button>
    </>
  );
}
