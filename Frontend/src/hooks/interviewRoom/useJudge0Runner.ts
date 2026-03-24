import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_LANGUAGES as JUDGE0_FALLBACK_LANGUAGES,
  judge0Service,
  type Judge0Language,
} from "../../services/judge0.service";

interface UseJudge0RunnerResult {
  languages: Judge0Language[];
  selectedLanguageId: number | null;
  setSelectedLanguageId: (id: number | null) => void;
  isRunning: boolean;
  output: string;
  runCode: (code: string) => void;
}

const extractLanguageKey = (name: string): string =>
  name
    .split("(")[0]
    .trim()
    .toLowerCase();

const extractVersionParts = (name: string): number[] => {
  const match = name.match(/(\d+(?:\.\d+)*)/);
  if (!match) return [];
  return match[1].split(".").map((part) => Number(part) || 0);
};

const compareVersions = (a: number[], b: number[]): number => {
  const maxLength = Math.max(a.length, b.length);
  for (let i = 0; i < maxLength; i += 1) {
    const aPart = a[i] ?? 0;
    const bPart = b[i] ?? 0;
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  return 0;
};

const getLatestLanguages = (langs: Judge0Language[]): Judge0Language[] => {
  const latestByKey = new Map<
    string,
    { language: Judge0Language; version: number[] }
  >();

  langs.forEach((lang) => {
    const key = extractLanguageKey(lang.name);
    const version = extractVersionParts(lang.name);
    const existing = latestByKey.get(key);

    if (!existing || compareVersions(version, existing.version) > 0) {
      latestByKey.set(key, { language: lang, version });
    }
  });

  return Array.from(latestByKey.values()).map((entry) => entry.language);
};

export function useJudge0Runner(
  interviewId: string | undefined
): UseJudge0RunnerResult {
  const [languages, setLanguages] = useState<Judge0Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadLanguages = async () => {
      try {
        const langs = await judge0Service.getLanguages();
        if (cancelled) return;

        const latestLanguages = getLatestLanguages(langs);
        setLanguages(latestLanguages);

        const preferred =
          latestLanguages.find((l) => /python/i.test(l.name)) ??
          latestLanguages.find((l) => /javascript/i.test(l.name)) ??
          latestLanguages[0];

        setSelectedLanguageId(preferred?.id ?? null);
      } catch {
        if (!cancelled) {
          setLanguages(JUDGE0_FALLBACK_LANGUAGES);
          setSelectedLanguageId(null);
        }
      }
    };

    loadLanguages();

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  const runCode = useCallback(
    (code: string) => {
      if (!selectedLanguageId) {
        setOutput("Select a language first, then run your code.");
        return;
      }

      setIsRunning(true);
      setOutput("Running...");

      void (async () => {
        try {
          const result = await judge0Service.executeCode({
            code,
            languageId: selectedLanguageId,
          });

          setOutput(result.output || "");
        } catch (err) {
          const errorWithResponse = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const message =
            errorWithResponse.response?.data?.message ??
            errorWithResponse.message ??
            "Execution failed. Please try again.";
          setOutput(String(message));
        } finally {
          setIsRunning(false);
        }
      })();
    },
    [selectedLanguageId]
  );

  return {
    languages,
    selectedLanguageId,
    setSelectedLanguageId,
    isRunning,
    output,
    runCode,
  };
}
