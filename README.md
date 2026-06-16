# AgentBlackBox ⬛️

**Flight Recorder & Interactive Graph Debugger for AI Agents**

AgentBlackBox is a professional, high-fidelity monitoring and debugging dashboard designed specifically for tracing the execution paths of autonomous AI agents. Built with modern enterprise constraints in mind, it provides an unparalleled level of introspection into agent decision-making, tool execution, and failure states.

## 🚀 Overview

As AI agents become more autonomous, understanding *why* an agent made a specific decision, *what* tools it invoked, and *where* it diverged from expected behavior becomes critically important. AgentBlackBox acts as the "flight recorder" for your AI systems, capturing complex execution traces and visualizing them in an interactive, navigable graph.

### Key Capabilities

*   **Interactive Execution Graph:** Visualize step-by-step agent execution flows (LLM calls, tool usage, decision points, and output steps) in an intuitive node-based UI using Cytoscape.js.
*   **Fidelity & Divergence Tracking:** When an agent's execution is replayed after a failed run, AgentBlackBox visually overlays the diverged execution path to highlight exactly where a "fix" altered the outcome.
*   **Deep Introspection (Inspector Panel):** Click on any execution node to instantly inspect the exact LLM prompt sent, the raw model response, parsed tool parameters, and complete contextual state snapshots at that exact moment in time.
*   **Universal Export Tools:** Easily port traces out of the dashboard via JSON, high-resolution PNG image exports, markdown summaries for incident reporting, or Mermaid.js strings for embedding in GitHub PRs and Notion docs.

## 🛠 Features

*   **Clean Enterprise UI:** A pristine, light-themed, high-contrast user interface inspired by tools like Linear and Notion, optimized for dense information display without visual fatigue.
*   **Interactive Node Graph:**
    *   **Color-Coded Nodes:** Distinct visual cues for Success, Error, LLM Activity, Tool Calls, and Logic branches.
    *   **Smooth Animations:** Nodes feature smooth layout transitions and visual feedback loops.
    *   **Custom Topology Support:** Adapts to complex, non-linear agent workflows using the Dagre layout engine.
*   **Replay & Step Controls:** VCR-like controls allow developers to step forward and backward through an agent's logic sequence, reconstructing the thought process one step at a time.
*   **Inject Fix Workflow:** A simulated environment for altering prompts or tool responses mid-execution to test divergence and calculate "Fidelity Scores."

## 🧱 Technical Architecture & Stack

AgentBlackBox is built with a focus on client-side rendering speed, type safety, and modular component architecture.

*   **Framework:** React 19 + TypeScript
*   **Build System:** Vite
*   **Styling:** Tailwind CSS (v4) + `clsx` & `tailwind-merge`
*   **Icons:** Lucide React
*   **Graph Visualization:** Cytoscape.js + `react-cytoscapejs` + `cytoscape-dagre`
*   **Data Structures:** Heavily typed definitions for `RunData`, `RunGraph`, `NodeData`, and `EdgeData` simulating a robust backend contract.

## 📂 Code Structure

```text
/src
├── components/          # Reusable, modular UI components
│   ├── BottomBar.tsx    # VCR controls and active status metrics
│   ├── GraphPanel.tsx   # Cytoscape graph canvas and layout engine
│   ├── Inspector.tsx    # Details pane for node prompts and data
│   ├── Sidebar.tsx      # Run list, filtering, and high-level stats
│   └── Topbar.tsx       # Global nav and export drop-down menus
├── lib/                 # Utility functions
│   └── utils.ts         # className merging (cn)
├── App.tsx              # Main application orchestrator
├── mockData.ts          # Realistic mock backend traces
├── type.ts              # TypeScript interface definitions
├── main.tsx             # Application entry point
└── index.css            # Global CSS and background patterns
```

## 🔌 Getting Started

1.  **Install Dependencies**
    Ensure you have `npm` installed. Run the following command to install the required packages:
    ```bash
    npm install
    ```

2.  **Start Development Server**
    Run the Vite local development server:
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    Compile the app into static files:
    ```bash
    npm run build
    ```

## 📊 Export Options Deep Dive

AgentBlackBox understands that debugging happens contextually across different platforms.

*   **Export JSON Trace:** Downloads the raw `RunData` schema, perfect for storing in S3 or attaching to unit tests.
*   **Export Graph as PNG:** Takes a snapshot of the Cytoscape canvas at 2x resolution with a white background. Use this for presentation decks.
*   **Copy Mermaid.js:** Automatically parses the Cytoscape nodes and edges into valid Mermaid syntax (`graph TD` or `graph LR`), making it seamless to visualize the trace in Markdown-supported renderers.
*   **Copy Markdown Summary:** Generates a clean text document that sequentially lists every step, its latency, the AI analysis, and any errors. Ideal for pasting into Slack during an active incident.

## 🔮 Future Roadmap (Conceptual)

*   **Live Webhook Support:** Connect directly to a LangChain or AutoGen backend to ingest traces in true real-time.
*   **State Diffing Engine:** A visual JSON diff tool in the Inspector panel showing exactly how the `stateSnapshot` mutated between step N and step N+1.
*   **Collaboration:** Shareable links to specific execution timestamps.

---
*Created during the AINS Hackathon 2026 - Use Case 2*
