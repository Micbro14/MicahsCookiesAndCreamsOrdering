export interface GroupedOption {
  label?: string;
  options: string[];
}

export const buildGroupedOptions = (source: Record<string, unknown>): GroupedOption[] => {
  const groups: GroupedOption[] = [];
  let currentGroup: GroupedOption | null = null;

  for (const key of Object.keys(source)) {
    if (!key || key === "__") continue;

    if (key.startsWith("_")) {
      const label = key.replace(/^_+/, "").trim();
      if (!label) continue;

      currentGroup = { label, options: [] };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup) {
      currentGroup.options.push(key);
    } else {
      groups.push({ options: [key] });
    }
  }

  return groups.filter((group) => group.options.length > 0);
};
