export type Severity = "critical" | "high" | "medium" | "low";

export type Category =
  | "pqc"
  | "weak-crypto"
  | "sql-injection"
  | "xss"
  | "code-injection"
  | "cors"
  | "tls"
  | "secrets";

export interface Vulnerability {
  id: string;
  file: string;
  line: number;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  matchedCode: string;
  suggestedFix: string;
  autoFixable: boolean;
}

export interface ScanResult {
  owner: string;
  repo: string;
  scannedAt: string;
  filesScanned: number;
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export interface RepoFile {
  path: string;
  content: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  language: string | null;
  private: boolean;
  description: string | null;
  html_url: string;
  updated_at: string;
}

export interface AutoFixResult {
  fixedCode: string;
  explanation: string;
  success: boolean;
}
