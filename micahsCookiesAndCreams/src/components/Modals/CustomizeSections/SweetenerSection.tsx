import type { GroupedOption } from "./optionGroups";

interface SweetenerSectionProps {
  sweetener1: string;
  sweetener2: string;
  sweetener1Amount: string;
  sweetener2Amount: string;
  optionGroups: GroupedOption[];
  amountOptions: string[];
  getOptionPrice?: (value: string, amount: string) => number;
  onIngredientFocus?: (key: string) => void;
  onSweetener1Change: (value: string) => void;
  onSweetener2Change: (value: string) => void;
  onSweetener1AmountChange: (value: string) => void;
  onSweetener2AmountChange: (value: string) => void;
}

export function SweetenerSection({
  sweetener1,
  sweetener2,
  sweetener1Amount,
  sweetener2Amount,
  optionGroups,
  amountOptions,
  getOptionPrice,
  onIngredientFocus,
  onSweetener1Change,
  onSweetener2Change,
  onSweetener1AmountChange,
  onSweetener2AmountChange,
}: SweetenerSectionProps) {
  return (
    <section className="customize-section">
      <h5>Sweeteners</h5>

      <label>
        Pick A First Sweetener
        <div className="select-with-price">
          <select
            value={sweetener1}
            onFocus={() => onIngredientFocus?.("sweetener1")}
            onChange={(event) => {
              onIngredientFocus?.("sweetener1");
              onSweetener1Change(event.target.value);
            }}
          >
            <option value="">Select a sweetener</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `sweetener-1-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{sweetener1 ? `$${(getOptionPrice?.(sweetener1, sweetener1Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Amount
        <select value={sweetener1Amount} onChange={(event) => onSweetener1AmountChange(event.target.value)}>
          <option value="">Select an amount</option>
          {amountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Pick A Second Sweetener (Optional)
        <div className="select-with-price">
          <select
            value={sweetener2}
            onFocus={() => onIngredientFocus?.("sweetener2")}
            onChange={(event) => {
              onIngredientFocus?.("sweetener2");
              onSweetener2Change(event.target.value);
            }}
          >
            <option value="">Select a second sweetener</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `sweetener-2-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{sweetener2 ? `$${(getOptionPrice?.(sweetener2, sweetener2Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Second Sweetener Amount
        <select value={sweetener2Amount} onChange={(event) => onSweetener2AmountChange(event.target.value)}>
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

export default SweetenerSection;
