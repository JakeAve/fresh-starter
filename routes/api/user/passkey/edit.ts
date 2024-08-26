import { Handlers } from "$fresh/server.ts";
import { getPasskeyByUserIdAndKeyId } from "../../../../db/kv/passkeySchema.ts";
import { User } from "$kv/userSchema.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const { id: userId } = ctx.state.rawUser as User;
      const keyId = ctx.params.keyId;

      const passkey = await getPasskeyByUserIdAndKeyId(userId, keyId);

      if (!passkey) {
        throw new Error(`No passkey found: ${keyId}`);
      }

      const json = await req.json();

      const nickname = json.nickname;

      return new Response(
        JSON.stringify({
          response: "ok",
          message: `Removed passkey ${nickname}`,
        }),
      );
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ message: "Bad request" }), {
        status: 400,
      });
    }
  },
};
