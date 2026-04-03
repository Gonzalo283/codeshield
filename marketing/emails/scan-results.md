# Scan Results Email

**Subject:** Scan complete: {vulnCount} vulnerabilities found in {repo}

---

Hi {firstName},

Your scan of **{repo}** is complete. Here is the summary.

### Vulnerability Summary

| Severity | Count |
|----------|-------|
| Critical | {criticalCount} |
| High     | {highCount} |
| Medium   | {mediumCount} |

### Top Critical Issues

1. **{vuln1Title}** -- {vuln1Description} (Line {vuln1Line})
2. **{vuln2Title}** -- {vuln2Description} (Line {vuln2Line})
3. **{vuln3Title}** -- {vuln3Description} (Line {vuln3Line})

{pqcSection}

---

View full report: https://codeshield.ai/reports/{reportId}

Upgrade to Team plan to enable AI-powered auto-fix, which generates secure replacement code for each vulnerability: https://codeshield.ai/pricing

-- CodeShield
