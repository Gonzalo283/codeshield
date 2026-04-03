import Anthropic from "@anthropic-ai/sdk";
import { Vulnerability, AutoFixResult } from "@/types";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

export async function generateFix(
  vulnerability: Vulnerability,
  fileContent?: string
): Promise<AutoFixResult> {
  const contextSnippet = fileContent
    ? extractContext(fileContent, vulnerability.line, 10)
    : vulnerability.matchedCode;

  try {
    const message = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a senior security engineer. Fix this vulnerability in the code.

**Vulnerability:** ${vulnerability.title}
**Severity:** ${vulnerability.severity.toUpperCase()}
**Category:** ${vulnerability.category}
**Description:** ${vulnerability.description}
**File:** ${vulnerability.file}
**Line:** ${vulnerability.line}

**Vulnerable Code Context:**
\`\`\`
${contextSnippet}
\`\`\`

**Matched Pattern:**
\`\`\`
${vulnerability.matchedCode}
\`\`\`

Respond in exactly this format:

FIXED_CODE:
\`\`\`
<the corrected code snippet>
\`\`\`

EXPLANATION:
<brief explanation of what was changed and why>`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const codeMatch = responseText.match(
      /FIXED_CODE:\s*```[\w]*\n?([\s\S]*?)```/
    );
    const explanationMatch = responseText.match(
      /EXPLANATION:\s*([\s\S]*?)$/
    );

    return {
      fixedCode: codeMatch?.[1]?.trim() || "Unable to generate fix.",
      explanation:
        explanationMatch?.[1]?.trim() ||
        "The vulnerability has been addressed with security best practices.",
      success: !!codeMatch,
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      fixedCode: "",
      explanation: "Failed to generate auto-fix. Please review manually.",
      success: false,
    };
  }
}

function extractContext(
  content: string,
  line: number,
  radius: number
): string {
  const lines = content.split("\n");
  const start = Math.max(0, line - 1 - radius);
  const end = Math.min(lines.length, line + radius);
  return lines
    .slice(start, end)
    .map((l, i) => `${start + i + 1}: ${l}`)
    .join("\n");
}
