import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';
import { mockRuns } from './src/mockData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let driver: Driver | null = null;

function getNeo4jDriver() {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      console.warn("Neo4j credentials not fully provided. API routes will fail.");
    } else {
      driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    }
  }
  return driver;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', neo4jConfigured: !!getNeo4jDriver() });
});

// Import mock data into Neo4j (for demonstration / resetting)
app.post('/api/neo4j/seed', async (req, res) => {
  const d = getNeo4jDriver();
  if (!d) return res.status(500).json({ error: 'Neo4j driver not configured' });

  const session = d.session();
  try {
    // Clear existing
    await session.run('MATCH (n) DETACH DELETE n');

    // For simplicity, we just import the first run from mockData to demonstrate
    const run = mockRuns[0];

    for (const node of run.graph.nodes) {
      await session.run(
        `
        CREATE (n:Node {
          id: $id,
          label: $label,
          type: $type,
          timestamp: $timestamp,
          latencyMs: $latencyMs,
          prompt: $prompt,
          response: $response,
          aiAnalysis: $aiAnalysis,
          annotations: $annotations
        })
        `,
        {
          id: node.data.id,
          label: node.data.label,
          type: node.data.type,
          timestamp: node.data.timestamp || '',
          latencyMs: node.data.latencyMs || 0,
          prompt: node.data.prompt || '',
          response: node.data.response || '',
          aiAnalysis: node.data.aiAnalysis || '',
          annotations: node.data.annotations || ''
        }
      );
    }

    for (const edge of run.graph.edges) {
      await session.run(
        `
        MATCH (a:Node {id: $source}), (b:Node {id: $target})
        CREATE (a)-[r:CONNECTS_TO {id: $id, label: $label}]->(b)
        `,
        {
          source: edge.data.source,
          target: edge.data.target,
          id: edge.data.id,
          label: edge.data.label || ''
        }
      );
    }

    res.json({ success: true, message: 'Seeded Neo4j with mock data.' });
  } catch (error: any) {
    console.error('Neo4j Seed Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Fetch graph from Neo4j
app.get('/api/neo4j/graph', async (req, res) => {
  const d = getNeo4jDriver();
  if (!d) return res.status(500).json({ error: 'Neo4j driver not configured' });

  const session = d.session();
  try {
    const nodesResult = await session.run('MATCH (n:Node) RETURN n');
    const edgesResult = await session.run('MATCH (a:Node)-[r:CONNECTS_TO]->(b:Node) RETURN r, a.id AS source, b.id AS target');

    const nodes = nodesResult.records.map(record => {
      const properties = record.get('n').properties;
      return { data: properties };
    });

    const edges = edgesResult.records.map(record => {
      const properties = record.get('r').properties;
      return {
        data: {
          ...properties,
          source: record.get('source'),
          target: record.get('target')
        }
      };
    });

    res.json({ nodes, edges });
  } catch (error: any) {
    console.error('Neo4j Fetch Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// Update annotation in Neo4j
app.post('/api/neo4j/node/:id/annotation', async (req, res) => {
  const d = getNeo4jDriver();
  if (!d) return res.status(500).json({ error: 'Neo4j driver not configured' });

  const { id } = req.params;
  const { annotations } = req.body;

  const session = d.session();
  try {
    const result = await session.run(
      'MATCH (n:Node {id: $id}) SET n.annotations = $annotations RETURN n',
      { id, annotations }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Neo4j Update Error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
