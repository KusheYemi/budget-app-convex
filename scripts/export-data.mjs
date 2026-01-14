import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function exportAllData() {
  console.log("📦 Starting data export...\n");

  try {
    // Query all tables
    console.log("Fetching users...");
    const users = await prisma.user.findMany({
      include: {
        budgetMonths: {
          include: {
            allocations: {
              include: {
                category: true,
              },
            },
          },
        },
        categories: true,
      },
    });

    console.log(`✓ Found ${users.length} users`);

    // Count totals
    let totalBudgetMonths = 0;
    let totalCategories = 0;
    let totalAllocations = 0;

    // Transform data for export (serialize Decimals)
    const exportData = {
      exportedAt: new Date().toISOString(),
      users: users.map(user => {
        const budgetMonths = user.budgetMonths.map(bm => {
          totalBudgetMonths++;
          const allocations = bm.allocations.map(a => {
            totalAllocations++;
            return {
              id: a.id,
              budgetMonthId: a.budgetMonthId,
              categoryId: a.categoryId,
              amount: Number(a.amount), // Decimal -> number
              amountInCents: Math.round(Number(a.amount) * 100), // Pre-calculate for Convex
              createdAt: a.createdAt.toISOString(),
              updatedAt: a.updatedAt.toISOString(),
            };
          });

          return {
            id: bm.id,
            userId: bm.userId,
            year: bm.year,
            month: bm.month,
            income: Number(bm.income), // Decimal -> number
            incomeInCents: Math.round(Number(bm.income) * 100), // Pre-calculate for Convex
            savingsRate: bm.savingsRate,
            adjustmentReason: bm.adjustmentReason,
            createdAt: bm.createdAt.toISOString(),
            updatedAt: bm.updatedAt.toISOString(),
            allocations,
          };
        });

        const categories = user.categories.map(c => {
          totalCategories++;
          return {
            id: c.id,
            userId: c.userId,
            name: c.name,
            color: c.color,
            isSavings: c.isSavings,
            isDefault: c.isDefault,
            sortOrder: c.sortOrder,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
          };
        });

        return {
          id: user.id,
          email: user.email,
          currency: user.currency,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          budgetMonths,
          categories,
        };
      }),
      metadata: {
        totalUsers: users.length,
        totalBudgetMonths,
        totalCategories,
        totalAllocations,
      },
      convexMigrationNotes: {
        moneyFields: "All 'amount' and 'income' fields have been converted to 'InCents' fields (multiply by 100). Use the *InCents fields when importing to Convex.",
        timestamps: "All timestamps are ISO strings. Convert to Date.now() format (milliseconds since epoch) for Convex.",
        ids: "Original UUIDs are preserved. You may need to map these to Convex's generated IDs during import.",
        uniqueConstraints: [
          "BudgetMonth: userId + year + month must be unique",
          "Category: userId + name must be unique",
          "Allocation: budgetMonthId + categoryId must be unique"
        ],
      }
    };

    // Write to file
    const outputPath = join(process.cwd(), "data-export.json");
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2), "utf-8");

    console.log(`\n✅ Export complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`   Users:         ${exportData.metadata.totalUsers}`);
    console.log(`   Budget Months: ${exportData.metadata.totalBudgetMonths}`);
    console.log(`   Categories:    ${exportData.metadata.totalCategories}`);
    console.log(`   Allocations:   ${exportData.metadata.totalAllocations}`);
    console.log(`\n📁 File saved to: ${outputPath}`);
    console.log(`\n💡 Notes:`);
    console.log(`   - All Decimal fields converted to numbers`);
    console.log(`   - *InCents fields added (amount * 100) for Convex import`);
    console.log(`   - Timestamps converted to ISO strings`);
    console.log(`   - All relationships preserved with IDs`);

  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportAllData();
