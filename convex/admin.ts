import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Doc, Id } from "./_generated/dataModel";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type UserSummary = {
  userId: Id<"users">;
  email: string | null;
  budgetMonths: number;
  categories: number;
  allocations: number;
  passwordAccounts: number;
  sessions: number;
  creationTime: number;
  hasData: boolean;
};

function pickUserToKeep(
  summaries: UserSummary[],
  preferredUserId?: Id<"users">,
) {
  if (preferredUserId) {
    const preferred = summaries.find((user) => user.userId === preferredUserId);
    if (preferred) {
      return preferred;
    }
  }
  return [...summaries].sort((a, b) => {
    if (b.budgetMonths !== a.budgetMonths) {
      return b.budgetMonths - a.budgetMonths;
    }
    if (b.allocations !== a.allocations) {
      return b.allocations - a.allocations;
    }
    if (b.categories !== a.categories) {
      return b.categories - a.categories;
    }
    return a.creationTime - b.creationTime;
  })[0];
}

type MutationCtx = GenericMutationCtx<DataModel>;

async function getUserSummary(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<UserSummary> {
  const [budgetMonths, categories, sessions, passwordAccounts] =
    await Promise.all([
      ctx.db.query("budgetMonths").withIndex("by_user", (q) =>
        q.eq("userId", user._id),
      ).collect(),
      ctx.db.query("categories").withIndex("by_user", (q) =>
        q.eq("userId", user._id),
      ).collect(),
      ctx.db.query("authSessions").withIndex("userId", (q) =>
        q.eq("userId", user._id),
      ).collect(),
      ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) =>
        q.eq("userId", user._id).eq("provider", "password"),
      ).collect(),
    ]);

  let allocationsCount = 0;
  for (const budgetMonth of budgetMonths) {
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) =>
        q.eq("budgetMonthId", budgetMonth._id),
      )
      .collect();
    allocationsCount += allocations.length;
  }

  return {
    userId: user._id,
    email: user.email ?? null,
    budgetMonths: budgetMonths.length,
    categories: categories.length,
    allocations: allocationsCount,
    passwordAccounts: passwordAccounts.length,
    sessions: sessions.length,
    creationTime: user._creationTime,
    hasData:
      budgetMonths.length > 0 || categories.length > 0 || allocationsCount > 0,
  };
}

export const resolveDuplicateEmail = internalMutation({
  args: {
    email: v.string(),
    dryRun: v.optional(v.boolean()),
    allowDeleteWithData: v.optional(v.boolean()),
    keepUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const allUsers = await ctx.db.query("users").collect();
    const matchingUsers = allUsers.filter(
      (user) => normalizeEmail(user.email ?? "") === normalizedEmail,
    );

    const allAccounts = await ctx.db.query("authAccounts").collect();
    const matchingAccounts = allAccounts.filter(
      (account) =>
        account.provider === "password" &&
        normalizeEmail(account.providerAccountId) === normalizedEmail,
    );

    if (matchingUsers.length === 0) {
      return {
        normalizedEmail,
        users: [],
        message: "No users found for this email.",
      };
    }

    const summaries = await Promise.all(
      matchingUsers.map((user) => getUserSummary(ctx, user)),
    );

    const keepUser = pickUserToKeep(summaries, args.keepUserId);
    const duplicateUsers = summaries.filter(
      (summary) => summary.userId !== keepUser.userId,
    );

    const accountsForKeepUser = matchingAccounts.filter(
      (account) => account.userId === keepUser.userId,
    );
    const primaryAccount = accountsForKeepUser.length > 0
      ? [...accountsForKeepUser].sort(
          (a, b) => b._creationTime - a._creationTime,
        )[0]
      : matchingAccounts.length > 0
        ? [...matchingAccounts].sort(
            (a, b) => b._creationTime - a._creationTime,
          )[0]
        : null;

    const accountIdsToDelete = matchingAccounts
      .filter((account) => account._id !== primaryAccount?._id)
      .map((account) => account._id);

    const allowDeleteWithData = args.allowDeleteWithData === true;
    const usersToDelete = duplicateUsers.filter(
      (summary) => allowDeleteWithData || !summary.hasData,
    );
    const skippedUsers = duplicateUsers.filter(
      (summary) => !allowDeleteWithData && summary.hasData,
    );

    const result = {
      normalizedEmail,
      keepUserId: keepUser.userId,
      primaryAccountId: primaryAccount?._id ?? null,
      users: summaries,
      duplicateUserIds: duplicateUsers.map((user) => user.userId),
      usersToDelete: usersToDelete.map((user) => user.userId),
      skippedUserIds: skippedUsers.map((user) => user.userId),
      accountIdsToDelete,
      dryRun: args.dryRun !== false,
    };

    if (args.dryRun !== false) {
      return result;
    }

    if (keepUser.email !== normalizedEmail) {
      await ctx.db.patch(keepUser.userId, { email: normalizedEmail });
    }

    if (primaryAccount) {
      await ctx.db.patch(primaryAccount._id, {
        userId: keepUser.userId,
        providerAccountId: normalizedEmail,
      });
    }

    const deletedAccountIds = new Set<string>();
    for (const accountId of accountIdsToDelete) {
      await ctx.db.delete(accountId);
      deletedAccountIds.add(accountId);
    }

    for (const summary of usersToDelete) {
      const budgetMonths = await ctx.db
        .query("budgetMonths")
        .withIndex("by_user", (q) => q.eq("userId", summary.userId))
        .collect();
      for (const budgetMonth of budgetMonths) {
        const allocations = await ctx.db
          .query("allocations")
          .withIndex("by_budgetMonth", (q) =>
            q.eq("budgetMonthId", budgetMonth._id),
          )
          .collect();
        for (const allocation of allocations) {
          await ctx.db.delete(allocation._id);
        }
        await ctx.db.delete(budgetMonth._id);
      }

      const categories = await ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", summary.userId))
        .collect();
      for (const category of categories) {
        await ctx.db.delete(category._id);
      }

      const authAccounts = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", summary.userId).eq("provider", "password"),
        )
        .collect();
      for (const account of authAccounts) {
        if (!deletedAccountIds.has(account._id)) {
          await ctx.db.delete(account._id);
          deletedAccountIds.add(account._id);
        }
      }

      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", summary.userId))
        .collect();
      for (const session of sessions) {
        const refreshTokens = await ctx.db
          .query("authRefreshTokens")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .collect();
        for (const token of refreshTokens) {
          await ctx.db.delete(token._id);
        }
        await ctx.db.delete(session._id);
      }

      await ctx.db.delete(summary.userId);
    }

    return {
      ...result,
      dryRun: false,
      deletedUserIds: usersToDelete.map((user) => user.userId),
    };
  },
});
