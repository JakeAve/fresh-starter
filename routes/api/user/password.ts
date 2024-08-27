import { FreshContext, Handlers } from "$fresh/server.ts";
import { updateUserByEmail, User } from "$kv/userSchema.ts";
import { ValidationError } from "../../../Errors/ValidationError.ts";
import {
  checkPasswordStrength,
  WeakPasswordError,
} from "$lib/passwordStrength.ts";
import { hashPassword, verifyPassword } from "$lib/passwordHashing.ts";

export const handler: Handlers = {
  async PUT(req: Request, ctx: FreshContext) {
    try {
      const json = await req.json();
      const { currentPassword, password, repeatPassword } = json;

      const user = ctx.state.rawUser as User;

      const isCurrentPassword = await verifyPassword(
        currentPassword,
        user.password,
      );

      if (!isCurrentPassword) {
        throw new ValidationError("Current password is incorrect");
      }

      if (password !== repeatPassword) {
        throw new ValidationError(
          "New password and repeat password do not match",
        );
      }

      await checkPasswordStrength(password);

      const hashedPassword = await hashPassword(password);

      await updateUserByEmail(user.email, { password: hashedPassword });

      return new Response(JSON.stringify({ status: "updated" }));
    } catch (err) {
      if (err instanceof WeakPasswordError) {
        const weakErr = err as WeakPasswordError;
        return new Response(
          JSON.stringify({
            ...weakErr.responseBody,
            message: weakErr.message,
          }),
        );
      }

      if (err instanceof ValidationError) {
        return new Response(JSON.stringify({ message: err.message }), {
          status: 400,
        });
      }

      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500 },
      );
    }
  },
};
