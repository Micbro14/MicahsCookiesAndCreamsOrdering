import type { GroupedOption } from "./optionGroups";

interface MilkTypeSectionProps {
  iceCreamBase: string;
  baseGroups: GroupedOption[];
  milkType1: string;
  milkType2: string;
  milkGroups: GroupedOption[];
  getOptionPrice?: (value: string, portion: number) => number;
  onIngredientFocus?: (key: string) => void;
  onIceCreamBaseChange: (value: string) => void;
  onMilkType1Change: (value: string) => void;
  onMilkType2Change: (value: string) => void;
}

export function MilkTypeSection({
  iceCreamBase,
  baseGroups,
  milkType1,
  milkType2,
  milkGroups,
  getOptionPrice,
  onIngredientFocus,
  onIceCreamBaseChange,
  onMilkType1Change,
  onMilkType2Change,
}: MilkTypeSectionProps) {
  return (
    <section className="customize-section">
      <h5>Milk Types</h5>

      <label>
        Pick an Ice Cream Base
        <select value={iceCreamBase} onChange={(event) => onIceCreamBaseChange(event.target.value)}>
          <option value="">Select a base</option>
          {baseGroups.map((group, groupIndex) => (
            <optgroup key={group.label ?? `base-${groupIndex}`} label={group.label ?? "General"}>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label>
        Pick Your Primary Milk Type
        <div className="select-with-price">
          <select
            value={milkType1}
            onFocus={() => onIngredientFocus?.("milkType1")}
            onChange={(event) => {
              onIngredientFocus?.("milkType1");
              onMilkType1Change(event.target.value);
            }}
          >
            <option value="">Select a milk type</option>
            {milkGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `milk-primary-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{milkType1 ? `$${(getOptionPrice?.(milkType1, 2 / 3) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Pick Your Secondary Milk Type
        <div className="select-with-price">
          <select
            value={milkType2}
            onFocus={() => onIngredientFocus?.("milkType2")}
            onChange={(event) => {
              onIngredientFocus?.("milkType2");
              onMilkType2Change(event.target.value);
            }}
          >
            <option value="">Select a milk type</option>
            {milkGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `milk-secondary-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{milkType2 ? `$${(getOptionPrice?.(milkType2, 1 / 3) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>
    </section>
  );
}

export default MilkTypeSection;
