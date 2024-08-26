import { Handlers } from "$fresh/server.ts";
import {
  deletePassKeyByUserIdAndKeyId,
  getPasskeyByUserIdAndKeyId,
} from "../../../../db/kv/passkeySchema.ts";
import { User } from "$kv/userSchema.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const { id: userId } = ctx.state.rawUser as User;
      const { passkeyId } = await req.json();

      const passkey = await getPasskeyByUserIdAndKeyId(userId, passkeyId);

      if (!passkey) {
        throw new Error(`No passkey found: ${passkeyId}`);
      }

      const nickname = passkey.nickname;

      await deletePassKeyByUserIdAndKeyId(userId, passkeyId);

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
