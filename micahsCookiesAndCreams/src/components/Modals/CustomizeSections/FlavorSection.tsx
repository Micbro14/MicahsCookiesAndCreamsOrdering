import type { GroupedOption } from "./optionGroups";

interface FlavorSectionProps {
  liquidMix1: string;
  liquidMix2: string;
  liquidMix1Amount: string;
  liquidMix2Amount: string;
  optionGroups: GroupedOption[];
  amountOptions: string[];
  getOptionPrice?: (value: string, amount: string) => number;
  onIngredientFocus?: (key: string) => void;
  onLiquidMix1Change: (value: string) => void;
  onLiquidMix2Change: (value: string) => void;
  onLiquidMix1AmountChange: (value: string) => void;
  onLiquidMix2AmountChange: (value: string) => void;
}

export function FlavorSection({
  liquidMix1,
  liquidMix2,
  liquidMix1Amount,
  liquidMix2Amount,
  optionGroups,
  amountOptions,
  getOptionPrice,
  onIngredientFocus,
  onLiquidMix1Change,
  onLiquidMix2Change,
  onLiquidMix1AmountChange,
  onLiquidMix2AmountChange,
}: FlavorSectionProps) {
  return (
    <section className="customize-section">
      <h5>Flavors</h5>

      <label>
        Pick A Flavor
        <div className="select-with-price">
          <select
            value={liquidMix1}
            onFocus={() => onIngredientFocus?.("liquidMix1")}
            onChange={(event) => {
              onIngredientFocus?.("liquidMix1");
              onLiquidMix1Change(event.target.value);
            }}
          >
            <option value="">Select a flavor</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `flavor-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{liquidMix1 ? `$${(getOptionPrice?.(liquidMix1, liquidMix1Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Amount
        <select value={liquidMix1Amount} onChange={(event) => onLiquidMix1AmountChange(event.target.value)}>
          <option value="">Select an amount</option>
          {amountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Pick a Second Flavor (Optional)
        <div className="select-with-price">
          <select
            value={liquidMix2}
            onFocus={() => onIngredientFocus?.("liquidMix2")}
            onChange={(event) => {
              onIngredientFocus?.("liquidMix2");
              onLiquidMix2Change(event.target.value);
            }}
          >
            <option value="">Select a second flavor</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `flavor-2-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{liquidMix2 ? `$${(getOptionPrice?.(liquidMix2, liquidMix2Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Second Flavor Amount
        <select value={liquidMix2Amount} onChange={(event) => onLiquidMix2AmountChange(event.target.value)}>
          <option value="">Select an amount</option>
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

export default FlavorSection;
