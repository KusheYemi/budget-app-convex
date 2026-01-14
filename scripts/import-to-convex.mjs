#!/usr/bin/env node

/**
 * Import data from Supabase export to Convex
 *
 * Usage:
 *   node scripts/import-to-convex.mjs
 *
 * Prerequisites:
 *   - Run `npx convex dev` in another terminal
 *   - Have data-export.json in the project root
 */

import { ConvexHttpClient } from "convex/browser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

async function getConvexUrl() {
  let convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    try {
      const envLocal = await fs.readFile(path.join(rootDir, ".env.local"), "utf-8");
      const match = envLocal.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
      if (match) {
        convexUrl = match[1].trim();
      }
    } catch {
      // Try .env
      try {
        const env = await fs.readFile(path.join(rootDir, ".env"), "utf-8");
        const match = env.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
        if (match) {
          convexUrl = match[1].trim();
        }
      } catch {
        // Ignore
      }
    }
  }

  return convexUrl;
}

async function main() {
  const convexUrl = await getConvexUrl();

  if (!convexUrl) {
    console.error("❌ Could not find NEXT_PUBLIC_CONVEX_URL");
    console.error("   Make sure you have run `npx convex dev` and have .env.local set up");
    process.exit(1);
  }

  console.log(`🔗 Connecting to Convex at ${convexUrl}...`);

  const client = new ConvexHttpClient(convexUrl);

  // Read the exported data
  const exportPath = path.join(rootDir, "data-export.json");
  console.log(`📂 Reading exported data from ${exportPath}...`);

  let exportData;
  try {
    exportData = JSON.parse(await fs.readFile(exportPath, "utf-8"));
  } catch (err) {
    console.error(`❌ Failed to read export file: ${err.message}`);
    process.exit(1);
  }

  console.log("\n📊 Data summary:");
  console.log(`   Users: ${exportData.metadata.totalUsers}`);
  console.log(`   Budget Months: ${exportData.metadata.totalBudgetMonths}`);
  console.log(`   Categories: ${exportData.metadata.totalCategories}`);
  console.log(`   Allocations: ${exportData.metadata.totalAllocations}`);

  console.log("\n🚀 Starting import...\n");

  try {
    // Dynamic import of the generated API
    const { api } = await import("../convex/_generated/api.js");

    const result = await client.mutation(api.import.importData, {
      users: exportData.users,
    });

    console.log("✅ Import completed!\n");
    console.log("📈 Results:");
    console.log(`   Users: ${result.users}`);
    console.log(`   Categories: ${result.categories}`);
    console.log(`   Budget Months: ${result.budgetMonths}`);
    console.log(`   Allocations: ${result.allocations}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      result.errors.forEach((err) => console.log(`   - ${err}`));
    }

    console.log("\n📝 Next steps:");
    console.log("   1. Users will need to sign up again with their email (passwords couldn't be migrated)");
    console.log("   2. Once signed up, their data will be automatically linked");
    console.log("   3. Delete convex/import.ts after verifying the data");
  } catch (err) {
    console.error(`\n❌ Import failed: ${err.message}`);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Make sure `npx convex dev` is running");
    console.error("   - Check if convex/_generated/api.js exists");
    console.error("   - Try running `npx convex dev` to regenerate the API");
    process.exit(1);
  }
}

main().catch(console.error);
