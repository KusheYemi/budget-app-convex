"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderIcon,
  CardTitle,
} from "@/components/ui/card";
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
    return () => {
      abortRef.current?.abort();
    };
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
            const parsed = JSON.parse(payload) as {
              text?: string;
              error?: string;
            };
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
          <Sparkles className="w-4 h-4" />
          {status === "idle" && "Get AI Analysis"}
          {status === "loading" && "Connecting..."}
          {status === "streaming" && "Analysing..."}
          {(status === "done" || status === "error") && "Refresh Analysis"}
        </Button>
      </div>

      {showCard && (
        <Card
          className={cn(
            "border-0 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300",
            status === "error" && "ring-1 ring-destructive/40"
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardHeaderIcon tone={status === "error" ? "warning" : "primary"}>
                {status === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </CardHeaderIcon>
              <CardTitle className="flex-1">
                AI Financial <span className="text-primary italic">Analysis</span>
              </CardTitle>
              {status === "streaming" && (
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse rounded-sm" />
              )}
            </div>
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
              <div className="prose-brand">
                <ReactMarkdown>{analysisText}</ReactMarkdown>
              </div>
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
