// OpenAPI 3.1 specification for the CodeShield public API
// Consumed by /docs/api viewer and by Swagger/Postman import.

const BASE_URL = process.env.NEXTAUTH_URL || "https://codeshield.sh";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "CodeShield API",
    version: "1.0.0",
    description:
      "Programmatic access to CodeShield's code-security scanner. Use this API from CI/CD pipelines, IDEs, or your own tools.",
    contact: {
      name: "CodeShield Support",
      email: "support@codeshield.sh",
      url: "https://codeshield.sh/docs",
    },
    license: { name: "CodeShield Terms", url: "https://codeshield.sh/terms" },
  },
  servers: [
    { url: `${BASE_URL}/api/v1`, description: "Production" },
  ],
  security: [{ BearerAuth: [] }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description:
          "API key in the format `cs_live_XXXXXXXXXXXX`. Generate at https://codeshield.sh/settings.",
      },
    },
    schemas: {
      ScanRequest: {
        type: "object",
        oneOf: [
          {
            required: ["code"],
            properties: {
              code: { type: "string", description: "Source code to scan (max 500KB)" },
              language: {
                type: "string",
                description: "File extension hint (ts, py, go, …). Defaults to ts.",
                example: "py",
              },
            },
          },
          {
            required: ["repo"],
            properties: {
              repo: {
                type: "string",
                description: "Public GitHub repo URL",
                example: "https://github.com/owner/repo",
              },
            },
          },
        ],
      },
      Vulnerability: {
        type: "object",
        properties: {
          file: { type: "string", example: "src/auth.ts" },
          line: { type: "integer", example: 42 },
          severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
          type: { type: "string", example: "sql-injection" },
          cwe: { type: "string", example: "CWE-89" },
          message: { type: "string" },
          codeSnippet: { type: "string" },
        },
      },
      ScanResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          scan: {
            type: "object",
            properties: {
              filesScanned: { type: "integer" },
              vulnerabilities: {
                type: "array",
                items: { $ref: "#/components/schemas/Vulnerability" },
              },
              summary: {
                type: "object",
                properties: {
                  critical: { type: "integer" },
                  high: { type: "integer" },
                  medium: { type: "integer" },
                  low: { type: "integer" },
                  total: { type: "integer" },
                },
              },
              scannedAt: { type: "string", format: "date-time" },
            },
          },
          usage: {
            type: "object",
            properties: {
              plan: { type: "string", example: "growth" },
              scansRemaining: { type: "integer", example: 849 },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "quota_exceeded",
          },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/scan": {
      post: {
        summary: "Run a security scan",
        description:
          "Scans either a snippet of code or a public GitHub repository. Counts against your monthly quota.",
        tags: ["Scan"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ScanRequest" },
              examples: {
                code: {
                  summary: "Scan code snippet",
                  value: { code: "eval(userInput)", language: "js" },
                },
                repo: {
                  summary: "Scan GitHub repo",
                  value: { repo: "https://github.com/expressjs/express" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Scan completed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ScanResponse" },
              },
            },
          },
          "400": {
            description: "Bad request",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "401": {
            description: "Missing or invalid API key",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "429": {
            description: "Rate limit or quota exceeded",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
  },
  tags: [{ name: "Scan", description: "Security scanning endpoints" }],
};

export async function GET() {
  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
