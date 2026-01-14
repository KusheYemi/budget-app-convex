import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      profile: (params) => {
        const email =
          typeof params.email === "string" ? normalizeEmail(params.email) : "";
        if (!email) {
          throw new Error("Email is required");
        }
        return { email };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.type !== "credentials" || args.provider.id !== "password") {
        return;
      }
      const email =
        typeof args.profile.email === "string"
          ? normalizeEmail(args.profile.email)
          : "";
      if (!email) {
        return;
      }

      const [usersByEmail, accountsByEmail] = await Promise.all([
        ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .collect(),
        ctx.db
          .query("authAccounts")
          .withIndex("providerAndAccountId", (q) =>
            q.eq("provider", "password").eq("providerAccountId", email),
          )
          .collect(),
      ]);

      const indexConflict =
        usersByEmail.some((user) => user._id !== args.userId) ||
        accountsByEmail.some((account) => account.userId !== args.userId);
      if (indexConflict) {
        throw new Error("Email already in use");
      }

      const [users, accounts] = await Promise.all([
        ctx.db.query("users").collect(),
        ctx.db.query("authAccounts").collect(),
      ]);
      const normalizedConflict =
        users.some(
          (user) =>
            user._id !== args.userId &&
            normalizeEmail(user.email ?? "") === email,
        ) ||
        accounts.some(
          (account) =>
            account.userId !== args.userId &&
            account.provider === "password" &&
            normalizeEmail(account.providerAccountId) === email,
        );
      if (normalizedConflict) {
        throw new Error("Email already in use");
      }
    },
  },
});
