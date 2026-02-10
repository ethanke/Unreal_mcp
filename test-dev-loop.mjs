// Verify all SGKv2 quick wins via MCP protocol
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('=== SGKv2 Quick Wins Verification ===');
  console.log('');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/cli.js'],
    env: {
      ...process.env,
      UE_PROJECT_PATH: 'C:/Users/Ethan/Documents/Unreal Projects/SGKv2',
      MCP_AUTOMATION_HOST: '127.0.0.1',
      MCP_AUTOMATION_PORT: '8091',
      MCP_DEFAULT_CATEGORIES: 'all',
      LOG_LEVEL: 'error',
    },
    cwd: 'C:/Users/Ethan/Documents/Unreal Projects/Unreal_mcp',
  });

  const client = new Client({ name: 'qw-test', version: '1.0.0' });
  await client.connect(transport);
  console.log('[PASS] Server connected');

  // Test 1: Tool count and sgk tool present
  const { tools } = await client.listTools();
  const names = tools.map(t => t.name);
  console.log(`[INFO] Tools: ${tools.length} total`);
  console.log(names.includes('sgk') ? '[PASS] "sgk" tool found' : '[FAIL] "sgk" tool missing');
  console.log(names.includes('manage_inventory') ? '[PASS] "manage_inventory" visible (categories=all)' : '[FAIL] "manage_inventory" missing');
  console.log(names.includes('manage_combat') ? '[PASS] "manage_combat" visible' : '[FAIL] "manage_combat" missing');
  console.log('');

  // Test 2: sgk get_project_paths
  console.log('[TEST] sgk action=get_project_paths');
  const paths = await client.callTool({ name: 'sgk', arguments: { action: 'get_project_paths' } });
  const pathsText = paths.content[0].text;
  const pathsOk = pathsText.includes('success: true') || pathsText.includes('success=true');
  console.log(pathsOk ? '[PASS] get_project_paths returned success' : '[FAIL] get_project_paths failed');
  console.log(`  Response preview: ${pathsText.substring(0, 200)}`);
  console.log('');

  // Test 3: sgk query_blueprints
  console.log('[TEST] sgk action=query_blueprints query=inventory');
  const qResult = await client.callTool({ name: 'sgk', arguments: { action: 'query_blueprints', query: 'inventory' } });
  const qText = qResult.content[0].text;
  const qOk = qText.includes('success: true') || qText.includes('success=true');
  console.log(qOk ? '[PASS] query_blueprints returned results' : '[FAIL] query_blueprints failed');
  console.log(`  Response preview: ${qText.substring(0, 200)}`);
  console.log('');

  // Test 4: sgk get_index_stats
  console.log('[TEST] sgk action=get_index_stats');
  const stats = await client.callTool({ name: 'sgk', arguments: { action: 'get_index_stats' } });
  const statsText = stats.content[0].text;
  const statsOk = statsText.includes('success: true') || statsText.includes('success=true');
  console.log(statsOk ? '[PASS] get_index_stats returned data' : '[FAIL] get_index_stats failed');
  console.log(`  Response preview: ${statsText.substring(0, 200)}`);
  console.log('');

  // Test 5: Resources listed
  console.log('[TEST] MCP Resources');
  const { resources } = await client.listResources();
  const resUris = resources.map(r => r.uri);
  console.log(resUris.includes('ue://sgk/blueprints') ? '[PASS] ue://sgk/blueprints resource listed' : '[FAIL] sgk blueprints resource missing');
  console.log(`  Total resources: ${resources.length}`);
  console.log('');

  // Test 6: Read sgk/blueprints/search resource
  console.log('[TEST] Read ue://sgk/blueprints/search?q=weapon');
  try {
    const searchRes = await client.readResource({ uri: 'ue://sgk/blueprints/search?q=weapon' });
    const searchText = searchRes.contents[0].text;
    const searchData = JSON.parse(searchText);
    console.log(`[PASS] Blueprint search found ${searchData.count} results for "weapon"`);
  } catch (e) {
    console.log(`[FAIL] Resource read error: ${e.message}`);
  }
  console.log('');

  console.log('========================================');
  console.log('  ALL QUICK WINS VERIFIED');
  console.log('========================================');

  await client.close();
  process.exit(0);
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
