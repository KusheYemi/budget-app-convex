import { convexAuth } from "@convex-dev/auth/server";
import type {
  EmailConfig,
  GenericActionCtxWithAuthConfig,
} from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { api } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const smtpPassword = process.env.RESEND_SMTP_PASSWORD ?? process.env.RESEND_API_KEY;

type AuthCtx = GenericActionCtxWithAuthConfig<DataModel>;
type EmailVerificationParams = Parameters<
  EmailConfig["sendVerificationRequest"]
>[0];

const sendPasswordResetEmail = async (
  params: EmailVerificationParams,
  ctx: AuthCtx,
) => {
  if (!smtpPassword || !resendFromEmail) {
    throw new Error("Missing RESEND_SMTP_PASSWORD or RESEND_FROM_EMAIL");
  }
  if (!params.identifier) {
    throw new Error("Missing email address");
  }
  if (!ctx?.runAction) {
    throw new Error("Missing Convex action context");
  }

  const resetUrl = new URL(params.url);
  const code = resetUrl.searchParams.get("code");
  if (code) {
    resetUrl.searchParams.delete("code");
    resetUrl.searchParams.set("resetCode", code);
  }

  await ctx.runAction(api.emails.sendPasswordResetEmail, {
    to: params.identifier,
    url: resetUrl.toString(),
  });
};

const emailProvider = Email({
  sendVerificationRequest:
    sendPasswordResetEmail as unknown as EmailConfig["sendVerificationRequest"],
});

const passwordResetProvider = {
  ...emailProvider,
  id: "password-reset",
  name: "Password Reset",
  from: resendFromEmail ?? emailProvider.from,
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile: (params) => {
        const email =
          typeof params.email === "string" ? normalizeEmail(params.email) : "";
        if (!email) {
          throw new Error("Email is required");
        }
        return { email };
      },
      reset: passwordResetProvider,
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
          .filter((q) => q.eq(q.field("email"), email))
          .collect(),
        ctx.db
          .query("authAccounts")
          .filter((q) =>
            q.and(
              q.eq(q.field("provider"), "password"),
              q.eq(q.field("providerAccountId"), email),
            ),
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
