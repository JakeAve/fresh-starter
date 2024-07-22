import { Handlers } from "$fresh/server.ts";
import { getChallengesByUserId } from "../../db/passkeyChallengeSchema.ts";
import { verifyAuthResponse } from "../../lib/passkeys.ts";
import { AuthenticationResponseJSON } from "@simplewebauthn/types";
import { /* addCount, */ getPasskeyById } from "../../db/passkeySchema.ts";
import { getUserById } from "../../db/userSchema.ts";
import { VerifiedAuthenticationResponse } from "@simplewebauthn/server";
import { signJwt } from "../../lib/jwt.ts";
import { makeAuthHeaders } from "../../lib/authentication.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      const body = await req.json();

      const { verifyPayload, sessionId } = body as {
        verifyPayload: AuthenticationResponseJSON;
        sessionId: string;
      };

      const challenge = await getChallengesByUserId(sessionId);

      if (!challenge) {
        throw new Error(`No challenge found for session ${sessionId}`);
      }

      const passkey = await getPasskeyById(verifyPayload.id);

      if (!passkey) {
        throw new Error(
          `Could not find passkey ${verifyPayload.id}`,
        );
      }

      const user = await getUserById(passkey.userId);

      if (!user) {
        throw new Error(`Could not find user ${passkey.userId}`);
      }

      let verification: VerifiedAuthenticationResponse | undefined;
      try {
        verification = await verifyAuthResponse(
          verifyPayload,
          challenge,
          passkey,
        );
      } catch (err) {
        console.error(err);
        throw new Error("Could not verify");
      }

      if (!verification.verified) {
        throw new Error("User not verified");
      }

    //   await addCount(user.id, passkey.id); // TODO: MacOs multi-device keys don't work with this

      const token = await signJwt({
        sub: user.email,
        iss: new URL(req.url).href,
        aud: "api",
      });

      const headers = makeAuthHeaders(req, new Headers(), token);

      return new Response(JSON.stringify({ token }), { headers });
    } catch (err) {
      console.error(err);
      return new Response(
        JSON.stringify({ message: err.message }),
        {
          status: 400,
        },
      );
    }
  },
};
