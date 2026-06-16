import { RunData } from './types';

export const mockRuns: RunData[] = [
  {
    id: 'RUN-9482',
    title: 'Jira Ticket Triage',
    date: '2026-06-16T10:15:00Z',
    status: 'success',
    stepsCount: 5,
    totalLatencyMs: 3450,
    fidelityScore: 98,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Receive Webhook', type: 'decision', timestamp: '10:15:00.000', latencyMs: 50, aiAnalysis: 'Triggered by Jira issue creation. Validated schema.' } },
        { data: { id: 'n2', label: 'Analyze Issue text', type: 'llm', timestamp: '10:15:00.050', latencyMs: 1200, prompt: 'Classify this issue: "DB failing to connect on startup"', response: 'Category: Backend, Priority: High', stateSnapshot: { ticketId: 'ENG-102' } } },
        { data: { id: 'n3', label: 'Check On-Call Roster', type: 'tool', timestamp: '10:15:01.250', latencyMs: 400, toolParameters: { service: 'PagerDuty', team: 'Backend' }, toolResponse: { onCall: 'alice@company.com' } } },
        { data: { id: 'n4', label: 'Assign Ticket', type: 'tool', timestamp: '10:15:01.650', latencyMs: 650, toolParameters: { ticketId: 'ENG-102', user: 'alice@company.com' }, toolResponse: { status: 'Assigned' } } },
        { data: { id: 'n5', label: 'Send Slack Alert', type: 'output', timestamp: '10:15:02.300', latencyMs: 1150, prompt: 'Send notification to #alerts-backend', response: 'Ok, message sent.' } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3', label: 'High Priority' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } },
        { data: { id: 'e4', source: 'n4', target: 'n5' } }
      ]
    }
  },
  {
    id: 'RUN-9483',
    title: 'Refund Processing (Failed)',
    date: '2026-06-16T11:05:00Z',
    status: 'failed',
    stepsCount: 3,
    totalLatencyMs: 8200,
    fidelityScore: 45,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Customer Request', type: 'decision', timestamp: '11:05:00.000', latencyMs: 20 } },
        { data: { id: 'n2', label: 'Determine Eligibility', type: 'llm', timestamp: '11:05:00.020', latencyMs: 1540, prompt: 'Customer wants refund for order #12345. Is it within 30 days?', response: 'Yes, eligible.', aiAnalysis: 'LLM correctly determined eligibility based on order date.' } },
        { data: { id: 'n3', label: 'Issue Stripe Refund', type: 'error', timestamp: '11:05:01.560', latencyMs: 6640, toolParameters: { orderId: '12345', amount: 50.00 }, toolResponse: { error: 'Insufficient funds in reserve account.' }, aiAnalysis: 'Tool call failed. The Stripe API rejected the refund due to account balance.', annotation: 'Need to add an interceptor for this error to notify finance.' } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } }
      ]
    }
  },
  {
    id: 'RUN-9485',
    title: 'Code Review Agent (Diverged)',
    date: '2026-06-16T12:20:00Z',
    status: 'warning',
    stepsCount: 4,
    totalLatencyMs: 4100,
    fidelityScore: 78,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Fetch PR Diff', type: 'tool', timestamp: '12:20:00.000', latencyMs: 300 } },
        { data: { id: 'n2', label: 'Analyze Diff (Original)', type: 'llm', timestamp: '12:20:00.300', latencyMs: 2100, prompt: 'Review this code for security issues.', response: 'Looks good.', aiAnalysis: 'Initial run missed a subtle SQL injection vector.' } },
        { data: { id: 'n3', label: 'Post Comment', type: 'output', timestamp: '12:20:02.400', latencyMs: 500 } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } }
      ]
    },
    divergedGraph: {
      nodes: [
        { data: { id: 'n1', label: 'Fetch PR Diff', type: 'tool', timestamp: '12:20:00.000', latencyMs: 300 } },
        { data: { id: 'n2_div', label: 'Analyze Diff (Fixed)', type: 'llm', timestamp: '12:20:00.300', latencyMs: 2500, prompt: 'Review this code for security issues. Focus intently on SQLi.', response: 'Found potential SQL injection on line 42.', aiAnalysis: 'Replay with injected fix successfully identified the vulnerability.' } },
        { data: { id: 'n3_div', label: 'Post Block Comment', type: 'output', timestamp: '12:20:02.800', latencyMs: 600 } }
      ],
      edges: [
        { data: { id: 'e1_div', source: 'n1', target: 'n2_div', isDiverged: true } },
        { data: { id: 'e2_div', source: 'n2_div', target: 'n3_div', isDiverged: true } }
      ]
    }
  },
  {
    id: 'RUN-9488',
    title: 'Daily Summary Email',
    date: '2026-06-16T13:00:00Z',
    status: 'success',
    stepsCount: 4,
    totalLatencyMs: 2800,
    fidelityScore: 100,
    graph: {
      nodes: [
        { data: { id: 'n1', label: 'Cron Trigger', type: 'decision', timestamp: '13:00:00.000', latencyMs: 10 } },
        { data: { id: 'n2', label: 'Query Metrics', type: 'tool', timestamp: '13:00:00.010', latencyMs: 800 } },
        { data: { id: 'n3', label: 'Draft Email', type: 'llm', timestamp: '13:00:00.810', latencyMs: 1500, prompt: 'Draft a summary email based on these metrics...', response: 'Dear Team, here is the summary...' } },
        { data: { id: 'n4', label: 'Send via SendGrid', type: 'output', timestamp: '13:00:02.310', latencyMs: 490 } }
      ],
      edges: [
        { data: { id: 'e1', source: 'n1', target: 'n2' } },
        { data: { id: 'e2', source: 'n2', target: 'n3' } },
        { data: { id: 'e3', source: 'n3', target: 'n4' } }
      ]
    }
  }
];
