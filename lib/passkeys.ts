import {
  generateRegistrationOptions,
  // verifyRegistrationResponse,
} from "@simplewebauthn/server";

const rpName = "DOC-5";

const rpID = "localhost";

// const origin = `http://${rpID}:8000`;

export function genRegistrationOptions(
  userName: string,
  userDisplayName: string,
  _existingKeys: unknown[],
) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userDisplayName,
    attestationType: "none",
    // excludeCredentials: existingKeys.map((key) => ({
    //     id: key?.id,
    //     transports: key?.transports,
    // })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });
}
