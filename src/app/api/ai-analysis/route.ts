import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { CURRENCIES } from "@/lib/validators";
import type { CurrencyCode } from "@/lib/validators";
import type { InsightsData } from "@/lib/insights-types";
import { formatCurrency } from "@/lib/utils";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface RequestBody {
  data: InsightsData;
  currency: CurrencyCode;
}

function buildPrompt(data: InsightsData, currencyCode: CurrencyCode): string {
  const currency = CURRENCIES[currencyCode];
  const savingsRatePercent = (data.averageSavingsRate * 100).toFixed(1);
  const lowSavingsCount = data.monthsWithLowSavings.length;
  const totalMonths = data.totalMonths;

  const topCategoriesText = data.topCategories
    .map((c, i) => `${i + 1}. ${c.name}: ${formatCurrency(c.total, currencyCode)}`)
    .join("\n");

  const lowSavingsContext =
    lowSavingsCount === 0
      ? "The user has never had a month with savings below 20%."
      : `The user had ${lowSavingsCount} out of ${totalMonths} month${totalMonths !== 1 ? "s" : ""} with savings below 20%.${
          data.monthsWithLowSavings.some((m) => m.adjustmentReason)
            ? " Some low-savings months had reasons provided: " +
              data.monthsWithLowSavings
                .filter((m) => m.adjustmentReason)
                .map((m) => `"${m.adjustmentReason}"`)
                .join("; ") +
              "."
            : ""
        }`;

  const recentTrendContext = (() => {
    if (data.monthlyTrends.length < 3) return "";
    const last3 = data.monthlyTrends.slice(-3);
    const first = last3[0].savingsRate;
    const last = last3[last3.length - 1].savingsRate;
    const direction =
      last > first + 0.02 ? "improving" : last < first - 0.02 ? "declining" : "stable";
    return `\n- Savings rate trend over the last 3 months: ${direction}`;
  })();

  return `You are a warm, knowledgeable personal finance advisor. Analyse this user's budgeting data and provide a personalised financial analysis.

FINANCIAL DATA (currency: ${currency.name}, symbol: ${currency.symbol}):
- Tracking period: ${totalMonths} month${totalMonths !== 1 ? "s" : ""}
- Average monthly income: ${currency.symbol}${data.averageIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- Average savings rate: ${savingsRatePercent}% (target: 20%)
- Average monthly savings: ${currency.symbol}${data.averageSavingsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- Total saved across all months: ${currency.symbol}${data.totalSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
- ${lowSavingsContext}${recentTrendContext}

TOP SPENDING CATEGORIES (cumulative totals):
${topCategoriesText || "No spending category data available."}

INSTRUCTIONS:
Write a personalised financial analysis in 3-4 short paragraphs. Do not use markdown headers, bullet points, or bold text — flowing prose only.

Cover these areas naturally:
1. An observation about their overall spending patterns and top categories
2. Honest, encouraging feedback on their ${savingsRatePercent}% average savings rate vs the 20% benchmark, acknowledging any months below target with documented reasons
3. One specific, actionable insight based on their top category or savings trend
4. 1-2 concrete recommendations tailored to their actual data

Keep the tone warm but honest. Reference their real numbers. Keep the response under 350 words.`;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!body.data || !body.currency || !(body.currency in CURRENCIES)) {
    return new Response("Missing or invalid data", { status: 400 });
  }

  const encoder = new TextEncoder();

  if (!process.env.ANTHROPIC_API_KEY) {
    const errorChunk = `data: ${JSON.stringify({ error: "AI analysis is not configured. Please add an ANTHROPIC_API_KEY to your environment." })}\n\n`;
    return new Response(encoder.encode(errorChunk), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const prompt = buildPrompt(body.data, body.currency);

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: unknown) {
        let message = "An unexpected error occurred.";
        if (err instanceof Anthropic.APIError) {
          message =
            err.status === 429
              ? "Rate limit reached. Please try again in a moment."
              : `API error: ${err.message}`;
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
