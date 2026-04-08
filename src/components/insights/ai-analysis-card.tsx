"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import type { InsightsData } from "@/lib/insights-types";

interface AIAnalysisCardProps {
  data: InsightsData;
  currency: CurrencyCode;
}

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function AIAnalysisCard({ data, currency }: AIAnalysisCardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [analysisText, setAnalysisText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  async function handleAnalyze() {
    abortRef.current?.abort();
    setAnalysisText("");
    setStatus("loading");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, currency }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to connect to analysis service.");
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            setStatus("done");
            return;
          }
          try {
            const parsed = JSON.parse(payload) as { text?: string; error?: string };
            if (parsed.error) {
              setAnalysisText(parsed.error);
              setStatus("error");
              return;
            }
            if (parsed.text) {
              setAnalysisText((prev) => prev + parsed.text);
            }
          } catch {
            // malformed chunk, skip
          }
        }
      }

      setStatus("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setAnalysisText("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const showCard = status !== "idle";
  const isDisabled = status === "loading" || status === "streaming";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleAnalyze}
          disabled={isDisabled}
          variant={status === "done" || status === "error" ? "outline" : "default"}
          className="gap-2"
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.816 1.916a2 2 0 00-1.272 1.272L12 21l-1.912-5.812a2 2 0 00-1.272-1.272L3 12l5.816-1.916a2 2 0 001.272-1.272z" />
          </svg>
          {status === "idle" && "Get AI Analysis"}
          {status === "loading" && "Connecting..."}
          {status === "streaming" && "Analysing..."}
          {(status === "done" || status === "error") && "Refresh Analysis"}
        </Button>
      </div>

      {showCard && (
        <Card
          className={cn(
            "transition-all duration-300",
            status === "error" && "border-destructive/40"
          )}
        >
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                AI Financial Analysis
                {status === "streaming" && (
                  <span className="inline-block w-1.5 h-4 bg-primary animate-pulse rounded-sm" />
                )}
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === "loading" && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            {(status === "streaming" || status === "done") && analysisText && (
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {analysisText}
              </p>
            )}

            {status === "error" && (
              <p className="text-sm text-destructive">
                {analysisText || "An unexpected error occurred. Please try again."}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
