import { RunData } from './types';

export const mockRuns: RunData[] = [
  {
    id: 'RUN-9482',
    title: 'Customer Onboarding Workflow',
    date: '2026-06-16T10:15:00Z',
    status: 'success',
    stepsCount: 6,
    totalLatencyMs: 4250,
    fidelityScore: 98,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Webhook: New User', type: 'decision', timestamp: '10:15:00.000', latencyMs: 45, aiAnalysis: 'Triggered by Stripe payment success webhook. Payload validated.' } },
        { data: { id: 'n2', label: 'Extract Profile Context', type: 'llm', timestamp: '10:15:00.045', latencyMs: 1400, prompt: 'Extract relevant metadata for CRM onboarding from stripe payload: { "customer": "cus_123", "email": "john.doe@acme.inc", "plan": "enterprise_annual", "company_size": "200-500" }', response: 'Extracted: Name: John Doe, Domain: acme.inc, Segment: Enterprise, Priority: High', stateSnapshot: { stripe_event: 'evt_123', retries: 0 } } },
        { data: { id: 'n3', label: 'Query Hubspot CRM', type: 'tool', timestamp: '10:15:01.445', latencyMs: 650, toolParameters: { action: 'search_company', domain: 'acme.inc' }, toolResponse: { found: true, companyId: '88201', accountManager: 'sarah.k@system.com' } } },
        { data: { id: 'n4', label: 'Create User Record', type: 'tool', timestamp: '10:15:02.095', latencyMs: 800, toolParameters: { action: 'create_contact', email: 'john.doe@acme.inc', companyId: '88201', plan: 'enterprise_annual' }, toolResponse: { contactId: 'con_5519', status: 'created' } } },
        { data: { id: 'n5', label: 'Generate Welcome Email', type: 'llm', timestamp: '10:15:02.895', latencyMs: 1100, prompt: 'Draft a personalized enterprise-tier welcome email from Account Manager Sarah K. Company is Acme Inc.', response: 'Subject: Welcome to the Enterprise Plan, Acme Inc!\\n\\nHi John,\\n\\nI am Sarah, your dedicated account manager...' } },
        { data: { id: 'n6', label: 'Dispatch Email', type: 'output', timestamp: '10:15:03.995', latencyMs: 255, toolParameters: { provider: 'SendGrid', to: 'john.doe@acme.inc', from: 'sarah.k@system.com' }, toolResponse: { messageId: 'sg.12345', delivered: true } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3', label: 'Enterprise Route' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } },
        { data: { id: 'e4', source: 'n4', target: 'n5' } },
        { data: { id: 'e5', source: 'n5', target: 'n6' } }
      ]
    }
  },
  {
    id: 'RUN-9483',
    title: 'Automated Refund Escalation',
    date: '2026-06-16T11:05:00Z',
    status: 'failed',
    stepsCount: 5,
    totalLatencyMs: 8200,
    fidelityScore: 45,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Support Ticket Ingest', type: 'decision', timestamp: '11:05:00.000', latencyMs: 20, stateSnapshot: { source: 'Zendesk', ticket_id: 'ZD-883' } } },
        { data: { id: 'n2', label: 'Intent Classification', type: 'llm', timestamp: '11:05:00.020', latencyMs: 1540, prompt: 'Classify intent of customer message: "I was charged twice for my subscription this month. I need a refund immediately."', response: 'Intent: Refund Request, Urgency: High, Category: Billing', aiAnalysis: 'LLM correctly determined intent.' } },
        { data: { id: 'n3', label: 'Fetch Payment History', type: 'tool', timestamp: '11:05:01.560', latencyMs: 1200, toolParameters: { customerId: 'cus_992', limit: 5 }, toolResponse: { charges: [{ id: 'ch_1', amount: 50.00, status: 'succeeded' }, { id: 'ch_2', amount: 50.00, status: 'succeeded' }] } } },
        { data: { id: 'n4', label: 'Verify Double Charge', type: 'llm', timestamp: '11:05:02.760', latencyMs: 2100, prompt: 'Analyze charges logic. Are there duplicate charges within 24h?', response: 'Yes, ch_1 and ch_2 occurred within 2 mins of each other.' } },
       { data: { id: 'n5', label: 'Issue Stripe Refund', type: 'error', timestamp: '11:05:04.860', latencyMs: 3340, toolParameters: { chargeId: 'ch_2', amount: 50.00, reason: 'duplicate' }, toolResponse: { error: 'Insufficient funds in API reserve account.', code: 'balance_insufficient' }, aiAnalysis: 'Tool call failed. The Stripe API rejected the refund due to account balance.', annotations: 'Need to add an interceptor for this error to notify finance instead of crashing the workflow.' } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3', label: 'Billing Flow' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } },
        { data: { id: 'e4', source: 'n4', target: 'n5', label: 'Issue Refund' } }
      ]
    }
  },
  {
    id: 'RUN-9485',
    title: 'Code Security Audit',
    date: '2026-06-16T12:20:00Z',
    status: 'warning',
    stepsCount: 4,
    totalLatencyMs: 6100,
    fidelityScore: 72,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'GitHub App Event', type: 'decision', timestamp: '12:20:00.000', latencyMs: 45, stateSnapshot: { repository: 'acme/backend', pr_number: 402 } } },
        { data: { id: 'n2', label: 'Fetch PR Diff', type: 'tool', timestamp: '12:20:00.045', latencyMs: 800, toolParameters: { owner: 'acme', repo: 'backend', pull_number: 402 }, toolResponse: { files_changed: 3, lines_added: 45 } } },
        { data: { id: 'n3', label: 'Analyze Diff (Original)', type: 'llm', timestamp: '12:20:00.845', latencyMs: 4100, prompt: 'Review this code for security issues:\\n```ts\\nconst query = `SELECT * FROM users WHERE email = \'${req.body.email}\'`;\\n```', response: 'The code looks fine, it uses string interpolation correctly.', aiAnalysis: 'CRITICAL FAILURE: Initial run missed a blatant SQL injection vector.' } },
        { data: { id: 'n4', label: 'Post PR Comment', type: 'output', timestamp: '12:20:04.945', latencyMs: 1155, toolParameters: { comment: 'LGTM! No security issues found.' } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } }
      ]
    },
    divergedGraph: {
      nodes: [
        { data: { id: 'n1', label: 'GitHub App Event', type: 'decision', timestamp: '12:20:00.000', latencyMs: 45 } },
        { data: { id: 'n2', label: 'Fetch PR Diff', type: 'tool', timestamp: '12:20:00.045', latencyMs: 800 } },
        { data: { id: 'n3_div', label: 'Analyze Diff (Fixed)', type: 'llm', timestamp: '12:20:00.845', latencyMs: 4800, prompt: 'Review this code for security issues. System prompt updated: Focus intently on SQL injection patterns. \\n```ts\\nconst query = `SELECT * FROM users WHERE email = \'${req.body.email}\'`;\\n```', response: 'VULNERABILITY DETECTED: The code uses raw string interpolation for a SQL query, making it vulnerable to SQL Injection. Use parameterized queries instead.', aiAnalysis: 'Replay with injected fix and updated system prompt successfully identified the vulnerability.' } },
        { data: { id: 'n4_div', label: 'Post Block Comment', type: 'output', timestamp: '12:20:05.645', latencyMs: 1200, toolParameters: { status: 'REQUEST_CHANGES', comment: '🚨 **Security Vulnerability Found**: SQL Injection...' } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2_div', source: 'n2', target: 'n3_div', isDiverged: true } },
        { data: { id: 'e3_div', source: 'n3_div', target: 'n4_div', isDiverged: true } }
      ]
    }
  },
  {
    id: 'RUN-9488',
    title: 'Nightly Metric Summary',
    date: '2026-06-16T13:00:00Z',
    status: 'success',
    stepsCount: 5,
    totalLatencyMs: 5800,
    fidelityScore: 100,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Cron Scheduler', type: 'decision', timestamp: '13:00:00.000', latencyMs: 10 } },
        { data: { id: 'n2', label: 'Query BigQuery', type: 'tool', timestamp: '13:00:00.010', latencyMs: 2400, toolParameters: { query: 'SELECT COUNT(*) as signups, SUM(revenue) as arr FROM `metrics.daily_rollup` WHERE date = CURRENT_DATE()' }, toolResponse: { rows: [{ signups: 412, arr: 15400.00 }] } } },
        { data: { id: 'n3', label: 'Query App Errors', type: 'tool', timestamp: '13:00:02.410', latencyMs: 1100, toolParameters: { service: 'Sentry', project: 'frontend', timeframe: '24h' }, toolResponse: { new_issues: 3, unresolved: 12 } } },
        { data: { id: 'n4', label: 'Draft Exec Summary', type: 'llm', timestamp: '13:00:03.510', latencyMs: 1800, prompt: 'Draft an executive summary email based on: Signups: 412, ARR: $15400. Errors: 3 new, 12 unresolved.', response: 'Subject: Daily Exec Summary - Growth & Stability\\n\\nKey Metrics:\\n- New Signups: +412\\n- Daily Booking: $15,400\\n- New Frontend Errors: 3\\n\\nOverall system health is stable. Revenue targets on track.' } },
        { data: { id: 'n5', label: 'Send to Leadership', type: 'output', timestamp: '13:00:05.310', latencyMs: 490, toolParameters: { to: 'exec-team@acme.inc', channel: 'email' }, toolResponse: { status: 'sent' } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n1', target: 'n3' } },
        { data: { id: 'e3', source: 'n2', target: 'n4' } },
        { data: { id: 'e4', source: 'n3', target: 'n4' } },
        { data: { id: 'e5', source: 'n4', target: 'n5' } }
      ]
    }
  },
  {
    id: 'RUN-9492',
    title: 'Social Media Content Gen',
    date: '2026-06-16T13:45:00Z',
    status: 'success',
    stepsCount: 7,
    totalLatencyMs: 12400,
    fidelityScore: 92,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'API Request', type: 'decision', timestamp: '13:45:00.000', latencyMs: 35, stateSnapshot: { topic: 'Future of AI in Healthcare', platform: 'LinkedIn' } } },
        { data: { id: 'n2', label: 'Search Recent News', type: 'tool', timestamp: '13:45:00.035', latencyMs: 1800, toolParameters: { query: 'AI in healthcare breakthroughs past week', engine: 'tavily' }, toolResponse: { results: ['FDA approves new AI diagnostic tool', 'Predictive models reducing hospital readmission rates'] } } },
        { data: { id: 'n3', label: 'Draft Content', type: 'llm', timestamp: '13:45:01.835', latencyMs: 3400, prompt: 'Draft a LinkedIn post about AI in healthcare using these news points...', response: 'The landscape of medicine is changing rapidly. Just this week, the FDA approved... #HealthTech #AI' } },
        { data: { id: 'n4', label: 'Generate Image Prompt', type: 'llm', timestamp: '13:45:05.235', latencyMs: 1200, prompt: 'Create an image generation prompt for a LinkedIn post about AI in healthcare.', response: 'A glowing digital connected brain overlaying a classic stethoscope on a clean medical desk, cinematic lighting, 4k, photorealistic' } },
        { data: { id: 'n5', label: 'Midjourney API', type: 'tool', timestamp: '13:45:06.435', latencyMs: 4800, toolParameters: { prompt: 'A glowing digital connected brain overlaying a classic stethoscope...' }, toolResponse: { url: 'https://cdn.midjourney.com/123/art.png' } } },
        { data: { id: 'n6', label: 'Review Quality', type: 'llm', timestamp: '13:45:11.235', latencyMs: 800, prompt: 'Does this generated text meet our brand guidelines? Text: The landscape...', response: 'Yes, tone is professional and engaging.' } },
        { data: { id: 'n7', label: 'Schedule Post', type: 'output', timestamp: '13:45:12.035', latencyMs: 365, toolParameters: { platform: 'Buffer', text: 'The landscape...', mediaUrls: ['https://cdn.midjourney.com/123/art.png'], scheduledAt: 'tomorrow 9am' }, toolResponse: { id: 'buf_882' } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } },
        { data: { id: 'e4', source: 'n4', target: 'n5' } },
        { data: { id: 'e5', source: 'n3', target: 'n6' } },
        { data: { id: 'e6', source: 'n5', target: 'n6' } },
        { data: { id: 'e7', source: 'n6', target: 'n7' } }
      ]
    }
  },
  {
    id: 'RUN-9501',
    title: 'Customer Churn Prediction',
    date: '2026-06-16T14:10:00Z',
    status: 'failed',
    stepsCount: 4,
    totalLatencyMs: 9600,
    fidelityScore: 20,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Batch Processing Trigger', type: 'decision', timestamp: '14:10:00.000', latencyMs: 15 } },
        { data: { id: 'n2', label: 'Fetch User Telemetry', type: 'tool', timestamp: '14:10:00.015', latencyMs: 4500, toolParameters: { bucket: 'telemetry_archive', date: 'yesterday' }, toolResponse: { data: '500MB parquet file', rows: 120000 } } },
        { data: { id: 'n3', label: 'Run Python Script', type: 'tool', timestamp: '14:10:04.515', latencyMs: 5000, toolParameters: { script: 'predict_churn.py', input: '500MB parquet file' }, toolResponse: { returncode: 1, stderr: 'ModuleNotFoundError: No module named pandas' }, annotations: 'Dependency mismatch in the worker container.' } },
        { data: { id: 'n4', label: 'Notify Pipeline Failure', type: 'error', timestamp: '14:10:09.515', latencyMs: 85, toolParameters: { channel: '#data-eng-alerts', message: 'Churn prediction job failed: ModuleNotFoundError' } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } }
      ]
    }
  },
  {
    id: 'RUN-9510',
    title: 'Parallel Threat Intel Scan',
    date: '2026-06-16T14:15:22Z',
    status: 'success',
    stepsCount: 8,
    totalLatencyMs: 7200,
    fidelityScore: 98,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Ingest Security Alert', type: 'decision', timestamp: '14:15:22.000', latencyMs: 30, stateSnapshot: { source: 'CrowdStrike', indicator: '198.51.100.44', type: 'IP', severity: 'high' } } },
        { data: { id: 'n2', label: 'Query VirusTotal', type: 'tool', timestamp: '14:15:22.030', latencyMs: 1200, toolParameters: { api: 'virustotal', ip: '198.51.100.44' }, toolResponse: { malicious: 14, suspicious: 4, undetected: 68 } } },
        { data: { id: 'n3', label: 'Query GreyNoise', type: 'tool', timestamp: '14:15:22.030', latencyMs: 850, toolParameters: { api: 'greynoise', ip: '198.51.100.44' }, toolResponse: { noise: true, classification: 'malicious', tags: ['SSH bruteforcer', 'Mirai'] } } },
        { data: { id: 'n4', label: 'Fetch Host Telemetry', type: 'tool', timestamp: '14:15:22.030', latencyMs: 3100, toolParameters: { host: 'srv-prod-04', timeframe: '1h' }, toolResponse: { connections_outbound: 1420, cpu_spike: true, suspicious_processes: ['curl'] } } },
        { data: { id: 'n5', label: 'Synthesize Intel', type: 'llm', timestamp: '14:15:25.130', latencyMs: 2400, prompt: 'Analyze parallel scan results for 198.51.100.44. VT: 14/86 malicious. GreyNoise: Mirai botnet scanner. Host telemetry: Suspicious outbound spike on port 443 with anomalous curl usage.', response: 'CONFIRMED MALICIOUS ACTIVITY. The host srv-prod-04 exhibits indicators of compromise (IoCs) consistent with Mirai botnet propagation. The IP is a known malicious scanner. Immediate isolation is recommended.', aiAnalysis: 'LLM successfully aggregated 3 decoupled data sources into a unified threat assessment.' } },
        { data: { id: 'n6', label: 'Escalation Decision', type: 'decision', timestamp: '14:15:27.530', latencyMs: 15, stateSnapshot: { confidence: 0.95, recommended_action: 'isolate' } } },
        { data: { id: 'n7', label: 'Isolate Host', type: 'tool', timestamp: '14:15:27.545', latencyMs: 1450, toolParameters: { target: 'srv-prod-04', action: 'network_quarantine' }, toolResponse: { status: 'success', policy_applied: 'strict_isolate_v2' } } },
        { data: { id: 'n8', label: 'Notify SOC Team', type: 'output', timestamp: '14:15:28.995', latencyMs: 205, toolParameters: { channel: '#soc-critical-alerts', message: 'Host srv-prod-04 isolated due to confirmed botnet activity from 198.51.100.44.' }, toolResponse: { delivered: true } } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n1', target: 'n3' } },
        { data: { id: 'e3', source: 'n1', target: 'n4' } },
        { data: { id: 'e4', source: 'n2', target: 'n5', label: 'Threat Data' } },
        { data: { id: 'e5', source: 'n3', target: 'n5', label: 'Threat Data' } },
        { data: { id: 'e6', source: 'n4', target: 'n5', label: 'Host Data' } },
        { data: { id: 'e7', source: 'n5', target: 'n6' } },
        { data: { id: 'e8', source: 'n6', target: 'n7', label: 'Severity > 0.9' } },
        { data: { id: 'e9', source: 'n7', target: 'n8' } }
      ]
    }
  }
];
