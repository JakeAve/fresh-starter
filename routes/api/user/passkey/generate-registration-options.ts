import { Handlers } from "$fresh/server.ts";
import { addChallenge } from "$kv/passkeyChallengeSchema.ts";
import { getPasskeysByUserId } from "$kv/passkeySchema.ts";
import { User } from "$kv/userSchema.ts";
import { genRegistrationOptions } from "../../../../lib/passkeys.ts";

export const handler: Handlers = {
  async POST(_req, ctx) {
    const { id: userId, name, email } = ctx.state.rawUser as User;
    const existingKeys = await getPasskeysByUserId(userId as string);

    const regOptions = await genRegistrationOptions(
      email as string,
      name as string,
      existingKeys,
    );

    await addChallenge(regOptions, userId);

    return new Response(JSON.stringify(regOptions));
  },
};
