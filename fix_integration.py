import re

with open('src/services/integrationService.ts', 'r') as f:
    lines = f.readlines()

# find getAllIntegrations
start = -1
for i, line in enumerate(lines):
    if "public static getAllIntegrations(): IntegrationItem[] {" in line:
        start = i
        break

if start != -1:
    end = -1
    for i in range(start + 1, len(lines)):
        if "public static saveIntegrations" in lines[i]:
            end = i - 1
            break
    
    if end != -1:
        new_func = """  public static getAllIntegrations(): IntegrationItem[] {
    try {
      const initial = CORE_RECOMMENDED_INTEGRATIONS;
      const data = StorageService.getItem<IntegrationItem[]>(STORAGE_KEY_INTEGRATIONS, initial);
      if (!Array.isArray(data) || data.length === 0) {
        StorageService.setItem(STORAGE_KEY_INTEGRATIONS, initial);
        return initial;
      }
      const validIds = new Set(CORE_RECOMMENDED_INTEGRATIONS.map(i => i.id));
      const cleaned = data.filter(p => validIds.has(p.id));
      CORE_RECOMMENDED_INTEGRATIONS.forEach(coreItem => {
        if (!cleaned.some(c => c.id === coreItem.id)) {
          cleaned.push(coreItem);
        }
      });
      return cleaned;
    } catch {
      return CORE_RECOMMENDED_INTEGRATIONS;
    }
  }
"""
        lines = lines[:start] + [new_func] + lines[end:]

with open('src/services/integrationService.ts', 'w') as f:
    f.writelines(lines)
