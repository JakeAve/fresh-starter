import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { Passkey } from "$kv/passkeySchema.ts";
import { Challenge } from "$kv/passkeyChallengeSchema.ts";
import { load } from "$std/dotenv/mod.ts";

const env = await load();

const rpName = env.PASSKEY_RP_NAME;

const rpID = env.PASSKEY_RP_ID;

const origin = env.PASSKEY_ORIGIN;

console.log({ rpName, rpID, origin });

export function genRegistrationOptions(
  userName: string,
  userDisplayName: string,
  _existingKeys: Passkey[],
) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userDisplayName,
    attestationType: "none",
    // excludeCredentials: existingKeys.map((key) => ({
    //     id: key.id,
    //     transports: key.transports,
    // })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });
}

export function verifyResponse(
  body: RegistrationResponseJSON,
  challenge: string,
) {
  return verifyRegistrationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
}

export function genAuthOptions() {
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    userVerification: "required",
  });
}

export function verifyAuthResponse(
  payloadResponse: AuthenticationResponseJSON,
  challengeOptions: Challenge,
  passkey: Passkey,
) {
  return verifyAuthenticationResponse({
    response: payloadResponse,
    requireUserVerification: true,
    expectedChallenge: challengeOptions.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: passkey.id,
      credentialPublicKey: passkey.publicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    },
  });
}
