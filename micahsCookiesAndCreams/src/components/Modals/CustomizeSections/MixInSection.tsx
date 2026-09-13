import type { GroupedOption } from "./optionGroups";

interface MixInSectionProps {
  mixIn1: string;
  mixIn2: string;
  mixInAmount: string;
  optionGroups: GroupedOption[];
  amountOptions: string[];
  getOptionPrice?: (value: string, amount: string) => number;
  onIngredientFocus?: (key: string) => void;
  onMixIn1Change: (value: string) => void;
  onMixIn2Change: (value: string) => void;
  onMixInAmountChange: (value: string) => void;
}

export function MixInSection({
  mixIn1,
  mixIn2,
  mixInAmount,
  optionGroups,
  amountOptions,
  getOptionPrice,
  onIngredientFocus,
  onMixIn1Change,
  onMixIn2Change,
  onMixInAmountChange,
}: MixInSectionProps) {
  return (
    <section className="customize-section">
      <h5>Mix-ins (Optional)</h5>

      <label>
        Pick A First Mix In
        <div className="select-with-price">
          <select
            value={mixIn1}
            onFocus={() => onIngredientFocus?.("mixIn1")}
            onChange={(event) => {
              onIngredientFocus?.("mixIn1");
              onMixIn1Change(event.target.value);
            }}
          >
            <option value="">Select a mix-in</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `mixin-1-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{mixIn1 ? `$${(getOptionPrice?.(mixIn1, mixInAmount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Pick A Second Mix In
        <div className="select-with-price">
          <select
            value={mixIn2}
            onFocus={() => onIngredientFocus?.("mixIn2")}
            onChange={(event) => {
              onIngredientFocus?.("mixIn2");
              onMixIn2Change(event.target.value);
            }}
          >
            <option value="">Select a second mix-in</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `mixin-2-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{mixIn2 ? `$${(getOptionPrice?.(mixIn2, mixInAmount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Amount (%)
        <select value={mixInAmount} onChange={(event) => onMixInAmountChange(event.target.value)}>
          <option value="">Select a mix-in percentage</option>
          {amountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

export default MixInSection;
