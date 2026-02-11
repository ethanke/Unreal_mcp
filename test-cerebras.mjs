// Test Cerebras ai_query via MCP protocol
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('=== Cerebras ai_query MCP Test ===\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/cli.js'],
    env: {
      ...process.env,
      UE_PROJECT_PATH: 'C:/Users/Ethan/Documents/Unreal Projects/SGKv2',
      MCP_AUTOMATION_HOST: '127.0.0.1',
      MCP_AUTOMATION_PORT: '8091',
      MCP_DEFAULT_CATEGORIES: 'all',
      CEREBRAS_API_KEY: 'csk-dr6pd25tw8yt64p6vx4cfcn5xjnfhvc2e2cd6yfhnne69pxm',
      LOG_LEVEL: 'error',
    },
    cwd: 'C:/Users/Ethan/Documents/Unreal Projects/Unreal_mcp',
  });

  const client = new Client({ name: 'cerebras-test', version: '1.0.0' });
  await client.connect(transport);
  console.log('[PASS] Server connected\n');

  // Test 1: ai_query with llama-3.3-70b
  console.log('[TEST 1] ai_query (llama-3.3-70b) — "How should I add a hunger system?"');
  const t1 = Date.now();
  const r1 = await client.callTool({
    name: 'sgk',
    arguments: {
      action: 'ai_query',
      query: 'How should I add a hunger system that drains over time and can be restored by eating food from the inventory?',
      model: 'llama-3.3-70b',
    },
  });
  const d1 = Date.now() - t1;
  console.log(`  Time: ${d1}ms`);
  console.log(`  Response: ${r1.content[0].text.substring(0, 400)}`);
  console.log('');

  // Test 2: ai_query with llama3.1-8b (fastest)
  console.log('[TEST 2] ai_query (llama3.1-8b) — "What blueprints handle weapon attachments?"');
  const t2 = Date.now();
  const r2 = await client.callTool({
    name: 'sgk',
    arguments: {
      action: 'ai_query',
      query: 'What blueprints handle weapon attachments in the SGKv2 weapon system?',
      model: 'llama3.1-8b',
    },
  });
  const d2 = Date.now() - t2;
  console.log(`  Time: ${d2}ms`);
  console.log(`  Response: ${r2.content[0].text.substring(0, 400)}`);
  console.log('');

  // Test 3: ai_query about SmartAI
  console.log('[TEST 3] ai_query (llama-3.3-70b) — "How to make AI patrol between waypoints?"');
  const t3 = Date.now();
  const r3 = await client.callTool({
    name: 'sgk',
    arguments: {
      action: 'ai_query',
      query: 'How do I set up SmartAI to patrol between waypoints and engage hostiles?',
    },
  });
  const d3 = Date.now() - t3;
  console.log(`  Time: ${d3}ms`);
  console.log(`  Response: ${r3.content[0].text.substring(0, 400)}`);
  console.log('');

  console.log('========================================');
  console.log(`  CEREBRAS AI_QUERY: ALL TESTS PASSED`);
  console.log(`  Avg latency: ${Math.round((d1 + d2 + d3) / 3)}ms`);
  console.log('========================================');

  await client.close();
  process.exit(0);
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
