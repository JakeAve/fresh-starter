import { Handlers } from "$fresh/server.ts";
import { addChallenge } from "../../db/passkeyChallengeSchema.ts";
import { bytesToBase64Url, genRandomBytes } from "../../lib/cryptoHelpers.ts";
import { genAuthOptions } from "../../lib/passkeys.ts";

export const handler: Handlers = {
  async POST(_req, _ctx) {
    try {
      const options = await genAuthOptions();

      const sessionId = bytesToBase64Url(genRandomBytes());

      await addChallenge(options, sessionId);

      return new Response(JSON.stringify({ options, sessionId }));
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
