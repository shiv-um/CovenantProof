"use client";
import { useState, useCallback } from "react";

export interface ProgressEvent {
  stage: string;
  progress: number;
  message: string;
  result?: any;
}

export function useAnalysisStream() {
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (caseId: string) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({ stage: "init", progress: 5, message: "Connecting to FastAPI engine..." });

    try {
      const response = await fetch(`http://localhost:8000/api/v1/cases/${caseId}/stream`, {
        method: "GET",
        headers: { Accept: "text/event-stream" },
      });

      if (!response.body) throw new Error("ReadableStream not supported by browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (chunk.startsWith("data: ")) {
            const dataStr = chunk.replace("data: ", "").trim();
            if (!dataStr) continue;
            const event: ProgressEvent = JSON.parse(dataStr);
            setProgress(event);
            if (event.stage === "complete") {
              setIsAnalyzing(false);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Streaming failed");
      setIsAnalyzing(false);
    }
  }, []);

  return { progress, isAnalyzing, error, startAnalysis };
}
