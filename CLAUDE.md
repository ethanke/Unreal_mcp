# CLAUDE.md — SGKv2 MCP Development Agent

## ROLE
You are an **MCP Development Agent** for the `ethanke/Unreal_mcp` fork. Your mission: iterate fast on MCP server customizations for the SGKv2 survival game project. You handle TypeScript MCP code, tool definitions, handlers, resources, and testing.

---

## FORK SETUP
- **origin** → `github.com/ethanke/Unreal_mcp` (our fork — push here)
- **upstream** → `github.com/ChiR24/Unreal_mcp` (original — pull updates)
- **Version**: 0.5.15 | **Language**: TypeScript (ESM) | **Runtime**: Node 18+

## PROJECT CONTEXT
- **SGKv2**: Unreal Engine 5.7 survival game at `C:\Users\Ethan\Documents\Unreal Projects\SGKv2`
- **Core Assets**: SurvivalGameKitV2 (inventory, building, weapons, crafting) + SmartAI (behaviors, spawners, combat)
- **BP Index**: 1032 blueprints indexed at `SGKv2/.bp-index/index.json` (263KB)
- **MCP Config**: Both Claude Code (`.mcp.json`) and Claude Desktop point to `dist/cli.js`

---

## DEV LOOP (FAST ITERATION)

### Edit → Build → Test (3 steps, ~5 seconds)
```bash
# 1. Edit source in src/
# 2. Build (TypeScript only, ~2s)
npx tsc -p tsconfig.json
# 3. Test via MCP protocol
node test-dev-loop.mjs
```

### Watch Mode (auto-rebuild on save)
```bash
npx tsc -p tsconfig.json --watch
```

### After changes: Claude Code/Desktop must be restarted to reload the MCP server.

---

## ARCHITECTURE

### Key Files
| File | Purpose |
|------|---------|
| `src/tools/consolidated-tool-definitions.ts` | All 35 tool schemas (name, category, inputSchema) |
| `src/tools/consolidated-tool-handlers.ts` | Handler registration (`toolRegistry.register(...)`) |
| `src/tools/handlers/sgk-handlers.ts` | **SGKv2-specific** handler (our custom code) |
| `src/tools/handlers/*.ts` | Domain handlers (50+ files) |
| `src/config/class-aliases.ts` | Actor class aliases (includes SGKv2 aliases) |
| `src/server/resource-registry.ts` | MCP resource declarations |
| `src/handlers/resource-handlers.ts` | Resource read handlers |
| `src/tools/dynamic-handler-registry.ts` | `toolRegistry` global instance |
| `src/server/tool-registry.ts` | Tool filtering by category, MCP protocol wiring |
| `src/automation/bridge.ts` | WebSocket bridge to UE Editor |
| `test-dev-loop.mjs` | MCP protocol test harness |

### Adding a New Tool (3 steps)
1. **Define schema** → append to array in `consolidated-tool-definitions.ts`
2. **Create handler** → new file in `src/tools/handlers/` or extend `sgk-handlers.ts`
3. **Register** → add `toolRegistry.register('name', handler)` in `consolidated-tool-handlers.ts`

### Adding a New Action to `sgk` Tool
1. Add action to `enum` in `consolidated-tool-definitions.ts` (search for `name: 'sgk'`)
2. Add `case` in `sgk-handlers.ts` switch statement
3. Build and test

### Adding MCP Resources
1. Add resource entry in `resource-registry.ts` (ListResources)
2. Add URI handler in `resource-handlers.ts` (ReadResource)

---

## SGKv2 KEY PATHS
```
/Game/SurvivalGameKitV2/Blueprints/Characters/BP_SGKMasterCharacter
/Game/SurvivalGameKitV2/Blueprints/BuildParts/BP_MasterBuildPart
/Game/SurvivalGameKitV2/Components/BP_MasterInventory
/Game/SurvivalGameKitV2/Blueprints/Items/ItemList
/Game/SurvivalGameKitV2/Blueprints/Items/CraftingRecipesList
/Game/SmartAI/Blueprints/AI/BP_MasterAIBase
/Game/SmartAI/Blueprints/AI/BT_AIMasterBehaviourTree
```

## CLASS ALIASES (in class-aliases.ts)
`SGKCharacter`, `SGKGameMode`, `SGKController`, `BuildPart`, `StorageBuildPart`, `CraftingBuildPart`, `CookingBuildPart`, `MasterInventory`, `AIBase`, `AISpawnPoint`, `AISpawnVolume`, `AIWaveSpawner`

---

## CONVENTIONS
- **TypeScript zero-any**: Use `unknown` or interfaces, never `as any` in runtime code
- **ESM modules**: All imports use `.js` extension (even for `.ts` files)
- **Handler pattern**: `export async function handleXTools(action, args, tools) { switch(action) {...} }`
- **Responses**: Return `{ success: boolean, ...data }` — the response validator wraps it into MCP format
- **SGKv2 tool actions**: Read from disk (`.bp-index/`) — no editor connection required
- **No C++ changes**: All customizations are TypeScript-only for fast iteration

## ANTI-PATTERNS
- Do NOT use `as any` — use `as Record<string, unknown>` or proper interfaces
- Do NOT modify upstream handler files unless necessary — prefer extending `sgk-handlers.ts`
- Do NOT add tools that require C++ plugin changes (too slow to iterate)
- Do NOT skip the build step — always run `npx tsc` before testing
- Do NOT forget `.js` extension in imports

## TESTING
```bash
# Full protocol test (starts server, lists tools, calls sgk tool, reads resources)
node test-dev-loop.mjs

# Quick build + test
npx tsc -p tsconfig.json && node test-dev-loop.mjs
```

---

## CURRENT CUSTOMIZATIONS (SGKv2-specific)
1. **`sgk` tool** — 4 actions: `query_blueprints`, `query_enriched`, `get_project_paths`, `get_index_stats`
2. **13 class aliases** — SGKv2 characters, building, inventory, SmartAI
3. **`spawn_blueprint` alias resolution** — uses ACTOR_CLASS_ALIASES map
4. **MCP resources** — `ue://sgk/blueprints`, `ue://sgk/blueprints/search?q=pattern`
5. **MCP_DEFAULT_CATEGORIES=all** — all 35 tools visible
