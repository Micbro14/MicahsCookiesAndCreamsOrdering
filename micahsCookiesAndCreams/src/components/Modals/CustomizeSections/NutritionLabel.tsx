interface IngredientBreakdownRow {
  key: string;
  label: string;
  amount: string;
  price: number;
}

interface NutritionLabelProps {
  title?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  nutrition?: Record<string, number | string | undefined>;
  totalPrice?: number;
  ingredientBreakdown?: IngredientBreakdownRow[];
  activeIngredientKey?: string;
  onIngredientHover?: (key: string) => void;
}

const defaultNutrition = {
  calories: 0,
  fat: 0,
  cholesterol: 0,
  sodium: 0,
  carbs: 0,
  fiber: 0,
  sugar: 0,
  protein: 0,
  servingSize: "2/3 cup (130g)",
  servingsPerContainer: 1,
};

const formatValue = (value: number, unit = "") => `${Math.round(value)}${unit}`;

export function NutritionLabel({
  title = "Nutrition Information",
  collapsed = false,
  onToggle,
  nutrition = defaultNutrition,
  totalPrice = 0,
  ingredientBreakdown = [],
  activeIngredientKey,
  onIngredientHover,
}: NutritionLabelProps) {
  const rows = [
    { label: "Calories", serving: Number(nutrition.caloriesServing ?? nutrition.calories ?? 0), container: Number(nutrition.calories ?? 0), unit: "" },
    { label: "Total Fat", serving: Number(nutrition.fatServing ?? nutrition.fat ?? 0), container: Number(nutrition.fat ?? 0), unit: "g" },
    { label: "Cholesterol", serving: Number(nutrition.cholesterolServing ?? nutrition.cholesterol ?? 0), container: Number(nutrition.cholesterol ?? 0), unit: "mg" },
    { label: "Sodium", serving: Number(nutrition.sodiumServing ?? nutrition.sodium ?? 0), container: Number(nutrition.sodium ?? 0), unit: "mg" },
    { label: "Total Carbs", serving: Number(nutrition.carbsServing ?? nutrition.carbs ?? 0), container: Number(nutrition.carbs ?? 0), unit: "g" },
    { label: "Fiber", serving: Number(nutrition.fiberServing ?? nutrition.fiber ?? 0), container: Number(nutrition.fiber ?? 0), unit: "g" },
    { label: "Sugar", serving: Number(nutrition.sugarServing ?? nutrition.sugar ?? 0), container: Number(nutrition.sugar ?? 0), unit: "g" },
    { label: "Protein", serving: Number(nutrition.proteinServing ?? nutrition.protein ?? 0), container: Number(nutrition.protein ?? 0), unit: "g" },
  ];
  const servingSize = String(nutrition.servingSize ?? defaultNutrition.servingSize);
  const servingsPerContainer = Number(nutrition.servingsPerContainer ?? defaultNutrition.servingsPerContainer);
  const focusedIngredient = ingredientBreakdown.find((item) => item.key === activeIngredientKey) ?? ingredientBreakdown[0];

  const gramsMatch = /\d+(?:\.\d+)?/g;
  const getIngredientGrams = (amount: string) => {
    const matches = amount.match(gramsMatch);
    const value = matches ? Number(matches[0]) : 0;
    return Number.isFinite(value) ? value : 0;
  };

  const totalIngredientGrams = ingredientBreakdown.reduce((sum, item) => sum + getIngredientGrams(item.amount), 0);
  const ingredientWeight = focusedIngredient ? getIngredientGrams(focusedIngredient.amount) : 0;
  const impactShare = totalIngredientGrams > 0 ? ingredientWeight / totalIngredientGrams : 0;
  const impactRows = [
    { label: "Calories", value: Number(nutrition.calories ?? 0) * impactShare },
    { label: "Fat", value: Number(nutrition.fat ?? 0) * impactShare },
    { label: "Carbs", value: Number(nutrition.carbs ?? 0) * impactShare },
    { label: "Sugar", value: Number(nutrition.sugar ?? 0) * impactShare },
    { label: "Protein", value: Number(nutrition.protein ?? 0) * impactShare },
  ].filter((row) => row.value > 0);

  return (
    <aside className="nutrition-panel">
      <div className="nutrition-header">
        <h5>{title}</h5>
        <button
          type="button"
          className="nutrition-toggle"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Open nutrition information" : "Close nutrition information"}
          onClick={onToggle}
        >
          {collapsed ? "Tap to open" : "Tap to close"}
        </button>
      </div>

      <div className="nutrition-total-block">
        <span>Ice cream total</span>
        <strong>${totalPrice.toFixed(2)}</strong>
      </div>

      {!collapsed && (
        <div className="nutrition-body">
          <div className="nutrition-summary">
            <strong>Servings per container:</strong>
            <span>{servingsPerContainer}</span>
            <br />
            <strong>Serving size:</strong>
            <span>{servingSize}</span>
          </div>

          {focusedIngredient && impactRows.length > 0 && (
            <div className="ingredient-impact-card" onMouseEnter={() => onIngredientHover?.(focusedIngredient.key)} onFocus={() => onIngredientHover?.(focusedIngredient.key)}>
              <div className="ingredient-impact-header">
                <span>Focused ingredient impact</span>
                <strong>{focusedIngredient.label}</strong>
              </div>
              <div className="ingredient-impact-metrics">
                {impactRows.map((row) => (
                  <span key={row.label}>
                    {row.label}: +{Math.round(row.value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="nutrition-grid">
            <div className="nutrition-grid-row nutrition-grid-header">
              <span>Nutrient</span>
              <span>Per serving</span>
              <span>Per container</span>
            </div>
            {rows.map((row) => (
              <div key={row.label} className="nutrition-grid-row">
                <span>{row.label}</span>
                <span>{formatValue(row.serving, row.unit)}</span>
                <span>{formatValue(row.container, row.unit)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default NutritionLabel;
