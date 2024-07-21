import { Handlers } from "$fresh/server.ts";
import {
  getChallengesByUserId,
} from "../../../../db/passkeyChallengeSchema.ts";
import { Passkey } from "../../../../db/passkeySchema.ts";
import { User } from "../../../../db/userSchema.ts";
import { verifyResponse } from "../../../../lib/passkeys.ts";
import {
  Base64URLString,
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/types";
import { addPasskey } from "../../../../db/passkeySchema.ts";
import { generateNickname } from "../../../../lib/nicknameGenerator.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const { id: userId } = ctx.state.rawUser as User;

      const currentOptions = await getChallengesByUserId(userId);

      if (!currentOptions) {
        throw new Error("Not found");
      }

      const body = await req.json();

      let verification;
      try {
        verification = await verifyResponse(
          body,
          currentOptions.challenge,
        );
      } catch (error) {
        console.error(error);
        throw new Error("Verification failed");
      }

      const { verified } = verification;

      if (!verified) {
        throw new Error("Verified is false");
      }

      const { registrationInfo } = verification;

      const {
        credentialID,
        credentialPublicKey,
        counter,
        credentialDeviceType,
        credentialBackedUp,
      } = registrationInfo as {
        credentialID: Base64URLString;
        credentialPublicKey: Uint8Array;
        counter: number;
        credentialDeviceType: CredentialDeviceType;
        credentialBackedUp: boolean;
      };

      const passkey: Passkey = {
        userId,
        webAuthnUserID:
          (currentOptions as PublicKeyCredentialCreationOptionsJSON).user.id,
        id: credentialID,
        publicKey: credentialPublicKey,
        counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: body.response.transports,
        nickname: generateNickname(),
      };

      await addPasskey(passkey);

      return new Response(
        JSON.stringify({ ...verification, nickname: passkey.nickname }),
      );
    } catch (err) {
      console.error(err);
      return new Response(
        JSON.stringify({ message: "Could not verify registration" }),
        { status: 400 },
      );
    }
  },
};
