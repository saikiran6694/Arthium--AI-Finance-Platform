import { useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import type { AssistantResponse } from "./types";
import BulletRenderer from "./_component/renderers/BulletRenderer";
import TableRenderer from "./_component/renderers/TableRenderer";
import ChartRenderer from "./_component/renderers/ChartRenderer";
import SuggestionsBar from "./_component/renderers/SuggestionBar";
import AdviceRenderer from "./_component/renderers/AdviceRenderer";
import WhatIfRenderer from "./_component/renderers/WhatIfRenderer";

export function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank
    if (!line.trim()) {
      result.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <CodeBlock key={i} code={codeLines.join("\n")} lang={lang} />
      );
      i++;
      continue;
    }

    // heading
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      result.push(
        <h1 key={i} className="text-lg font-bold mt-3 mb-1">
          {inlineMarkdown(h1[1])}
        </h1>
      );
      i++;
      continue;
    }
    if (h2) {
      result.push(
        <h2 key={i} className="text-base font-semibold mt-3 mb-1">
          {inlineMarkdown(h2[1])}
        </h2>
      );
      i++;
      continue;
    }
    if (h3) {
      result.push(
        <h3 key={i} className="text-sm font-semibold mt-2 mb-0.5">
          {inlineMarkdown(h3[1])}
        </h3>
      );
      i++;
      continue;
    }

    // bullet
    if (line.match(/^[-*]\s/)) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={i} className="list-disc pl-5 space-y-1 my-1">
          {bullets.map((b, bi) => (
            <li key={bi} className="text-sm">
              {inlineMarkdown(b)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      result.push(
        <ol key={i} className="list-decimal pl-5 space-y-1 my-1">
          {items.map((it, ii) => (
            <li key={ii} className="text-sm">
              {inlineMarkdown(it)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // paragraph
    result.push(
      <span key={i} className="text-sm leading-relaxed">
        {inlineMarkdown(line)}
      </span>
    );
    i++;
  }
  return result;
}

function inlineMarkdown(text: string): React.ReactNode {
  // bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-black/10 dark:bg-white/10 rounded px-1 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── Code block with copy button ─────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 dark:bg-white/5">
        <span className="text-[11px] text-muted-foreground font-mono">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-xs leading-relaxed bg-black/10 dark:bg-white/5">
        <code>{code}</code>
      </pre>
    </div>
  );
}


function TextRenderer({ message }: { message: string }) {
  return <div className="space-y-1">{renderMarkdown(message)}</div>;
}

function ErrorRenderer({ raw }: { raw: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-red-500">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{raw}</span>
    </div>
  );
}

export function ResponseRenderer({
  parsed,
  raw,
  isError,
  onSuggest
}: {
  parsed?: AssistantResponse;
  raw: string;
  isError?: boolean;
  onSuggest?: (prompt: string) => void;
}) {
  if (isError) return <ErrorRenderer raw={raw} />;
  if (!parsed) return <TextRenderer message={raw} />;

  switch (parsed.format) {
    case "text":
      return (
        <>
          <TextRenderer message={parsed.message} />
          {parsed.suggestions && onSuggest && (
            <SuggestionsBar suggestions={parsed.suggestions} onSelect={onSuggest} delay={200} />
          )}
        </>
      );
    case "bullets":
      return <BulletRenderer data={parsed} onSuggest={onSuggest} />;
    case "table":
      return <TableRenderer data={parsed} onSuggest={onSuggest} />;
    case "chart":
      return <ChartRenderer data={parsed} onSuggest={onSuggest} />;
    case "advice":
      return <AdviceRenderer data={parsed} onSuggest={onSuggest} />;
    case "whatif":
      return <WhatIfRenderer data={parsed} onSuggest={onSuggest} />;
    default:
      return <TextRenderer message={raw} />;
  }
}