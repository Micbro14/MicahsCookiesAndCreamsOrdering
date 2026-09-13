import type { GroupedOption } from "./optionGroups";

interface ThickenerSectionProps {
  thickener: string;
  thickener2: string;
  thickener3: string;
  thickenerAmount: string;
  thickener2Amount: string;
  thickener3Amount: string;
  optionGroups: GroupedOption[];
  amountOptions: string[];
  getOptionPrice?: (value: string, amount: string) => number;
  onIngredientFocus?: (key: string) => void;
  onThickenerChange: (value: string) => void;
  onThickener2Change: (value: string) => void;
  onThickener3Change: (value: string) => void;
  onThickenerAmountChange: (value: string) => void;
  onThickener2AmountChange: (value: string) => void;
  onThickener3AmountChange: (value: string) => void;
}

export function ThickenerSection({
  thickener,
  thickener2,
  thickener3,
  thickenerAmount,
  thickener2Amount,
  thickener3Amount,
  optionGroups,
  amountOptions,
  getOptionPrice,
  onIngredientFocus,
  onThickenerChange,
  onThickener2Change,
  onThickener3Change,
  onThickenerAmountChange,
  onThickener2AmountChange,
  onThickener3AmountChange,
}: ThickenerSectionProps) {
  return (
    <section className="customize-section">
      <h5>Thickeners</h5>
      <div className="info-banner">
        Thickeners adjust texture and viscosity, helping balance mouthfeel and stability.
      </div>

      <label>
        Pick Your Thickener
        <div className="select-with-price">
          <select
            value={thickener}
            onFocus={() => onIngredientFocus?.("thickener")}
            onChange={(event) => {
              onIngredientFocus?.("thickener");
              onThickenerChange(event.target.value);
            }}
          >
            <option value="">Select a thickener</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `thickener-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{thickener ? `$${(getOptionPrice?.(thickener, thickenerAmount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Amount
        <select value={thickenerAmount} onChange={(event) => onThickenerAmountChange(event.target.value)}>
          <option value="">Select an amount</option>
          {amountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Pick A Second Thickener (Optional)
        <div className="select-with-price">
          <select
            value={thickener2}
            onFocus={() => onIngredientFocus?.("thickener2")}
            onChange={(event) => {
              onIngredientFocus?.("thickener2");
              onThickener2Change(event.target.value);
            }}
          >
            <option value="">Select a second thickener</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `thickener-2-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{thickener2 ? `$${(getOptionPrice?.(thickener2, thickener2Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Second Thickener Amount
        <select value={thickener2Amount} onChange={(event) => onThickener2AmountChange(event.target.value)}>
          <option value="">Select an amount</option>
          {amountOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        Pick A Third Thickener (Optional)
        <div className="select-with-price">
          <select
            value={thickener3}
            onFocus={() => onIngredientFocus?.("thickener3")}
            onChange={(event) => {
              onIngredientFocus?.("thickener3");
              onThickener3Change(event.target.value);
            }}
          >
            <option value="">Select a third thickener</option>
            {optionGroups.map((group, groupIndex) => (
              <optgroup key={group.label ?? `thickener-3-${groupIndex}`} label={group.label ?? "General"}>
                {group.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="ingredient-price-chip">{thickener3 ? `$${(getOptionPrice?.(thickener3, thickener3Amount) ?? 0).toFixed(2)}` : "$0.00"}</span>
        </div>
      </label>

      <label>
        Third Thickener Amount
        <select value={thickener3Amount} onChange={(event) => onThickener3AmountChange(event.target.value)}>
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

export default ThickenerSection;
