/**
 * SGKv2 Project-Specific Handlers
 * Provides shortcuts for common SGKv2 survival game operations.
 * All actions read from disk (.bp-index/) — no editor connection required.
 */
import { ITools } from '../../types/tool-interfaces.js';
import type { HandlerArgs } from '../../types/handler-types.js';
import fs from 'fs';
import path from 'path';

interface BPIndexEntry {
  n: string;  // name
  m: number;  // modified timestamp
  s: number;  // size
  t: string;  // type
}

interface BPIndex {
  meta: { version: string; lastUpdated: string; totalBlueprints: number; project: string };
  index: Record<string, BPIndexEntry>;
}

function loadBPIndex(): BPIndex | null {
  const projectPath = process.env.UE_PROJECT_PATH;
  if (!projectPath) return null;
  const indexPath = path.join(projectPath, '.bp-index', 'index.json');
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch {
    return null;
  }
}

function loadAIIndex(): Record<string, unknown> | null {
  const projectPath = process.env.UE_PROJECT_PATH;
  if (!projectPath) return null;
  const indexPath = path.join(projectPath, '.bp-index', 'ai_index.json');
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } catch {
    return null;
  }
}

export async function handleSGKTools(
  action: string,
  args: HandlerArgs,
  _tools: ITools
): Promise<Record<string, unknown>> {
  const a = args as Record<string, unknown>;

  switch (action) {
    case 'query_blueprints': {
      const query = (typeof a.query === 'string' ? a.query : '').toLowerCase();
      const bpType = typeof a.type === 'string' ? a.type : undefined;
      const limit = typeof a.limit === 'number' ? a.limit : 25;

      const index = loadBPIndex();
      if (!index) return { success: false, error: 'BP index not found. Run Build-BPIndex.ps1 scan first.' };

      let results = Object.entries(index.index)
        .filter(([p, info]) =>
          p.toLowerCase().includes(query) || info.n.toLowerCase().includes(query)
        );

      if (bpType) {
        results = results.filter(([, info]) => info.t === bpType);
      }

      return {
        success: true,
        query,
        count: results.length,
        results: results.slice(0, limit).map(([p, info]) => ({
          path: p,
          name: info.n,
          type: info.t,
          sizeKB: Math.round(info.s / 1024),
        })),
      };
    }

    case 'query_enriched': {
      const query = (typeof a.query === 'string' ? a.query : '').toLowerCase();
      const limit = typeof a.limit === 'number' ? a.limit : 10;

      const aiIndex = loadAIIndex();
      if (!aiIndex) return { success: false, error: 'AI index not found. Run AI-Index.ps1 enrich first.' };

      const results = Object.entries(aiIndex)
        .filter(([p, info]: [string, any]) =>
          p.toLowerCase().includes(query) ||
          (info.purpose || '').toLowerCase().includes(query) ||
          (info.agent_hint || '').toLowerCase().includes(query)
        )
        .slice(0, limit)
        .map(([p, info]: [string, any]) => ({
          path: p,
          purpose: info.purpose,
          category: info.category,
          complexity: info.complexity,
          agent_hint: info.agent_hint,
        }));

      return { success: true, query, count: results.length, results };
    }

    case 'get_project_paths': {
      return {
        success: true,
        paths: {
          characters: '/Game/SurvivalGameKitV2/Blueprints/Characters',
          buildParts: '/Game/SurvivalGameKitV2/Blueprints/BuildParts',
          components: '/Game/SurvivalGameKitV2/Components',
          items: '/Game/SurvivalGameKitV2/Blueprints/Items',
          other: '/Game/SurvivalGameKitV2/Blueprints/Other',
          saving: '/Game/SurvivalGameKitV2/Blueprints/Saving',
          foliage: '/Game/SurvivalGameKitV2/Components/Foliage',
          ai: '/Game/SmartAI/Blueprints/AI',
        },
        keyBlueprints: {
          masterCharacter: '/Game/SurvivalGameKitV2/Blueprints/Characters/BP_SGKMasterCharacter',
          gameMode: '/Game/SurvivalGameKitV2/Blueprints/Characters/BP_SGKGameMode',
          controller: '/Game/SurvivalGameKitV2/Blueprints/Characters/BP_SGKController',
          gameInstance: '/Game/SurvivalGameKitV2/Blueprints/Saving/BP_SGKGameInstance',
          masterBuildPart: '/Game/SurvivalGameKitV2/Blueprints/BuildParts/BP_MasterBuildPart',
          masterInventory: '/Game/SurvivalGameKitV2/Components/BP_MasterInventory',
          masterItemInventory: '/Game/SurvivalGameKitV2/Components/BP_MasterItemInventory',
          equipmentInventory: '/Game/SurvivalGameKitV2/Components/BP_EquipmentInventory',
          craftingComponent: '/Game/SurvivalGameKitV2/Components/BP_CraftingComponent',
          cookingComponent: '/Game/SurvivalGameKitV2/Components/BP_CookingComponent',
          aiBase: '/Game/SmartAI/Blueprints/AI/BP_MasterAIBase',
          aiBehaviorTree: '/Game/SmartAI/Blueprints/AI/BT_AIMasterBehaviourTree',
          aiBlackboard: '/Game/SmartAI/Blueprints/AI/BB_AIBlackBoard',
          aiSpawnPoint: '/Game/SmartAI/Blueprints/AI/BP_AISpawnPoint',
          aiSpawnVolume: '/Game/SmartAI/Blueprints/AI/BP_AISpawningVolume',
        },
        dataAssets: {
          itemList: '/Game/SurvivalGameKitV2/Blueprints/Items/ItemList',
          craftingRecipes: '/Game/SurvivalGameKitV2/Blueprints/Items/CraftingRecipesList',
          cookingList: '/Game/SurvivalGameKitV2/Blueprints/Items/CookingList',
          buildPartList: '/Game/SurvivalGameKitV2/Blueprints/BuildParts/BuildPartList',
          itemSpawnerList: '/Game/SurvivalGameKitV2/Blueprints/Items/ItemSpawnerList',
        },
      };
    }

    case 'get_index_stats': {
      const index = loadBPIndex();
      if (!index) return { success: false, error: 'BP index not found.' };

      const typeCounts: Record<string, number> = {};
      const pathPrefixes: Record<string, number> = {};

      for (const [p, info] of Object.entries(index.index)) {
        typeCounts[info.t] = (typeCounts[info.t] || 0) + 1;
        const prefix = p.split('/').slice(0, 3).join('/');
        pathPrefixes[prefix] = (pathPrefixes[prefix] || 0) + 1;
      }

      return {
        success: true,
        meta: index.meta,
        typeCounts,
        topPaths: Object.entries(pathPrefixes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([p, count]) => ({ path: p, count })),
      };
    }

    default:
      return { success: false, error: `Unknown sgk action: ${action}` };
  }
}
