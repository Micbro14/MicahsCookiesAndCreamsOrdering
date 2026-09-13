import { useEffect, useMemo, useState } from "react";
import { useDataContext } from "../../context/DataContext";
import type { FlavorSpec, WorksheetDict } from "../../types";
import { CalculationUtilities } from "../../utils/calculations";
import { ModalShell } from "./ModalShell";
import { MilkTypeSection } from "./CustomizeSections/MilkTypeSection";
import { ThickenerSection } from "./CustomizeSections/ThickenerSection";
import { FlavorSection } from "./CustomizeSections/FlavorSection";
import { MixInSection } from "./CustomizeSections/MixInSection";
import { SweetenerSection } from "./CustomizeSections/SweetenerSection";
import { NutritionLabel } from "./CustomizeSections/NutritionLabel";
import { buildGroupedOptions } from "./CustomizeSections/optionGroups";

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  flavor?: FlavorSpec;
  initialSize?: string;
  initialQuantity?: number;
  initialLactoseFree?: boolean;
}

export function CustomizeModal({
  isOpen,
  onClose,
  flavor,
  initialSize,
  initialQuantity = 1,
  initialLactoseFree = false,
}: CustomizeModalProps) {
  const {
    workbook,
    milkWorksheet,
    milkPreDoneMixesWorksheet,
    thickenerWorksheet,
    flavorWorksheet,
    solidMixInWorksheet,
    sweetenerWorksheet,
    sizeOptions,
    sizeSpecsDict,
    liquidSpecs,
    thickenerSpecs,
    solidSpecs,
    sweetenerSpecs,
    premadeWorksheet,
  } = useDataContext();

  const iceCreamBaseGroups = useMemo(() => buildGroupedOptions(milkPreDoneMixesWorksheet), [milkPreDoneMixesWorksheet]);
  const milkGroups = useMemo(() => buildGroupedOptions(milkWorksheet), [milkWorksheet]);
  const thickenerGroups = useMemo(() => buildGroupedOptions(thickenerWorksheet), [thickenerWorksheet]);
  const flavorGroups = useMemo(() => buildGroupedOptions(flavorWorksheet), [flavorWorksheet]);
  const mixInGroups = useMemo(() => buildGroupedOptions(solidMixInWorksheet), [solidMixInWorksheet]);
  const sweetenerGroups = useMemo(() => buildGroupedOptions(sweetenerWorksheet), [sweetenerWorksheet]);
  const liquidAmountOptions = useMemo(() => Object.keys(liquidSpecs).filter((key) => key && !key.startsWith("_")), [liquidSpecs]);
  const thickenerAmountOptions = useMemo(() => Object.keys(thickenerSpecs).filter((key) => key && !key.startsWith("_")), [thickenerSpecs]);
  const mixInAmountOptions = useMemo(() => Object.keys(solidSpecs).filter((key) => key && !key.startsWith("_")), [solidSpecs]);
  const sweetenerAmountOptions = useMemo(() => Object.keys(sweetenerSpecs).filter((key) => key && !key.startsWith("_")), [sweetenerSpecs]);

  const [flavorName, setFlavorName] = useState(flavor?.name ?? "");
  const [iceCreamBase, setIceCreamBase] = useState("");
  const [milkType1, setMilkType1] = useState("");
  const [milkType2, setMilkType2] = useState("");
  const [thickener, setThickener] = useState("");
  const [thickener2, setThickener2] = useState("");
  const [thickener3, setThickener3] = useState("");
  const [thickenerAmount, setThickenerAmount] = useState("Auto");
  const [thickener2Amount, setThickener2Amount] = useState("Auto");
  const [thickener3Amount, setThickener3Amount] = useState("Auto");
  const [liquidMix1, setLiquidMix1] = useState("");
  const [liquidMix2, setLiquidMix2] = useState("");
  const [liquidMix1Amount, setLiquidMix1Amount] = useState("1");
  const [liquidMix2Amount, setLiquidMix2Amount] = useState("1");
  const [mixIn1, setMixIn1] = useState("");
  const [mixIn2, setMixIn2] = useState("");
  const [mixInAmount, setMixInAmount] = useState("15");
  const [sweetener1, setSweetener1] = useState("");
  const [sweetener2, setSweetener2] = useState("");
  const [sweetener1Amount, setSweetener1Amount] = useState("1");
  const [sweetener2Amount, setSweetener2Amount] = useState("1");
  const [quantity, setQuantity] = useState(initialQuantity);
  const [lactoseFree, setLactoseFree] = useState(initialLactoseFree);
  const [selectedSize, setSelectedSize] = useState(initialSize ?? sizeOptions[0] ?? "");
  const [nutritionCollapsed, setNutritionCollapsed] = useState(false);
  const [activeIngredientKey, setActiveIngredientKey] = useState<string>("liquidMix1");
  const upcharge = Number(workbook?.Sheets["Specs"]?.N2?.v ?? 1);

  const getIngredientPrice = (
    worksheet: WorksheetDict,
    optionValue: string,
    amountValue: string,
    type: "flavor" | "thickener" | "sweetener" | "solid" = "flavor"
  ) => {
    if (!optionValue || !amountValue) return 0;

    const calculator = new CalculationUtilities(upcharge);

    if (type === "solid") {
      const data = calculator.calculateSolidPrice(worksheet, solidSpecs, sizeSpecsDict, optionValue, amountValue, selectedSize, undefined);
      return Number((data.price1 ?? 0).toFixed(2));
    }

    const milkAmount = type === "thickener" ? sizeAmount : 0;
    const data = calculator.calculateSegmentPrice(
      worksheet,
      type === "sweetener" ? sweetenerSpecs : type === "thickener" ? thickenerSpecs : liquidSpecs,
      sizeSpecsDict,
      optionValue,
      amountValue,
      selectedSize,
      milkAmount,
      type
    );

    return Number((data.price ?? 0).toFixed(2));
  };

  const sizeAmount = Number((sizeSpecsDict[selectedSize] ?? sizeSpecsDict[sizeOptions[0] ?? ""] ?? { amount: 130 }).amount) || 130;

  const ingredientPricing = useMemo(() => {
    const calculator = new CalculationUtilities(upcharge);
    const thickenerData = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener, thickenerAmount, selectedSize, sizeAmount, "thickener");
    const thickener2Data = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener2, thickener2Amount, selectedSize, sizeAmount, "thickener");
    const thickener3Data = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener3, thickener3Amount, selectedSize, sizeAmount, "thickener");
    const liquidMix1Data = calculator.calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1, liquidMix1Amount, selectedSize, 0, "flavor");
    const liquidMix2Data = calculator.calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2, liquidMix2Amount, selectedSize, 0, "flavor");
    const sweetener1Data = calculator.calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1, sweetener1Amount, selectedSize, 0, "sweetener");
    const sweetener2Data = calculator.calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2, sweetener2Amount, selectedSize, 0, "sweetener");
    const solidSimulated = calculator.calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, mixIn1, mixInAmount, selectedSize, mixIn2);

    const milkType1Data = calculator.calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType1, selectedSize, 2 / 3, 0);
    const milkType2Data = calculator.calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType2, selectedSize, 1 / 3, 0);

    const items = [
      { key: "milkType1", label: milkType1 || "Milk 1", amount: `${Math.round(milkType1Data.grams || 0)}g`, price: milkType1Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "milkType2", label: milkType2 || "Milk 2", amount: `${Math.round(milkType2Data.grams || 0)}g`, price: milkType2Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "thickener", label: thickener || "Thickener", amount: `${Math.round(thickenerData.amount || 0)}g`, price: thickenerData.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "thickener2", label: thickener2 || "Thickener 2", amount: `${Math.round(thickener2Data.amount || 0)}g`, price: thickener2Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "thickener3", label: thickener3 || "Thickener 3", amount: `${Math.round(thickener3Data.amount || 0)}g`, price: thickener3Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "liquidMix1", label: liquidMix1 || "Flavor 1", amount: `${Math.round(liquidMix1Data.amount || 0)}g`, price: liquidMix1Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "liquidMix2", label: liquidMix2 || "Flavor 2", amount: `${Math.round(liquidMix2Data.amount || 0)}g`, price: liquidMix2Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "sweetener1", label: sweetener1 || "Sweetener 1", amount: `${Math.round(sweetener1Data.amount || 0)}g`, price: sweetener1Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "sweetener2", label: sweetener2 || "Sweetener 2", amount: `${Math.round(sweetener2Data.amount || 0)}g`, price: sweetener2Data.price, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "mixIn1", label: mixIn1 || "Mix-In 1", amount: `${Math.round(solidSimulated.amount1 || 0)}g`, price: solidSimulated.price1, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
      { key: "mixIn2", label: mixIn2 || "Mix-In 2", amount: `${Math.round(solidSimulated.amount2 || 0)}g`, price: solidSimulated.price2, impact: { calories: 0, fat: 0, protein: 0, carbs: 0, sugar: 0, sodium: 0 } },
    ].filter((item) => item.label && item.label !== "" && item.price > 0);

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    return {
      items,
      subtotal: Number(subtotal.toFixed(2)),
    };
  }, [
    flavorWorksheet,
    liquidMix1,
    liquidMix1Amount,
    liquidMix2,
    liquidMix2Amount,
    liquidSpecs,
    milkType1,
    milkType2,
    milkWorksheet,
    mixIn1,
    mixIn2,
    mixInAmount,
    selectedSize,
    sizeAmount,
    sizeSpecsDict,
    solidMixInWorksheet,
    solidSpecs,
    sweetener1,
    sweetener1Amount,
    sweetener2,
    sweetener2Amount,
    sweetenerWorksheet,
    sweetenerSpecs,
    thickener,
    thickener2,
    thickener2Amount,
    thickener3,
    thickener3Amount,
    thickenerSpecs,
    thickenerWorksheet,
  ]);

  const nutritionStats = useMemo(() => {
    const calculator = new CalculationUtilities(upcharge);
    const sizeSpec = sizeSpecsDict[selectedSize] ?? sizeSpecsDict[sizeOptions[0] ?? ""] ?? { amount: 130 };
    const sizeAmount = Number(sizeSpec.amount) || 130;

    const getNutrientValue = (
      worksheet: Record<string, Record<string, unknown>>,
      value: string,
      fieldNames: string[],
      amount: number,
      conversionFactor = 15,
      gramEquivalent = 1
    ): number => {
      if (!value || !worksheet[value] || !amount) return 0;

      const row = worksheet[value];
      const fieldName = fieldNames.find(
        (field) => row[field] !== undefined && row[field] !== null && row[field] !== ""
      );

      if (!fieldName) return 0;

      const valueNumber = Number(row[fieldName] ?? 0);
      const normalizedFactor = Math.max(Number(conversionFactor) || 1, 1);
      const normalizedGramEquivalent = Math.max(Number(gramEquivalent) || 1, 1);

      return (amount / normalizedFactor) * valueNumber * (normalizedGramEquivalent === 1 ? 1 : 1 / normalizedGramEquivalent);
    };

    const thickenerData = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener, thickenerAmount, selectedSize, sizeAmount, "thickener");
    const thickener2Data = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener2, thickener2Amount, selectedSize, sizeAmount, "thickener");
    const thickener3Data = calculator.calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener3, thickener3Amount, selectedSize, sizeAmount, "thickener");
    const liquidMix1Data = calculator.calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1, liquidMix1Amount, selectedSize, 0, "flavor");
    const liquidMix2Data = calculator.calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2, liquidMix2Amount, selectedSize, 0, "flavor");
    const sweetener1Data = calculator.calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1, sweetener1Amount, selectedSize, 0, "sweetener");
    const sweetener2Data = calculator.calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2, sweetener2Amount, selectedSize, 0, "sweetener");
    const solidSimulated = calculator.calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, mixIn1, mixInAmount, selectedSize, mixIn2);

    const milkType1Grams = sizeAmount * (2 / 3);
    const milkType2Grams = sizeAmount * (1 / 3);

    const calories =
      getNutrientValue(thickenerWorksheet, thickener, ["Calories"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Calories"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Calories"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Calories"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Calories"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Calories"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Calories"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Calories"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Calories"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Calories"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Calories"], milkType2Grams, 240);

    const totalFat =
      getNutrientValue(thickenerWorksheet, thickener, ["Fat (g)", "Fat"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Fat (g)", "Fat"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Fat (g)", "Fat"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Fat (g)", "Fat"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Fat (g)", "Fat"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Fat (g)", "Fat"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Fat (g)", "Fat"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Fat (g)", "Fat"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Fat (g)", "Fat"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Fat (g)", "Fat"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Fat (g)", "Fat"], milkType2Grams, 240);

    const cholesterol =
      getNutrientValue(thickenerWorksheet, thickener, ["Cholesterol (mg)", "Cholesterol"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Cholesterol (mg)", "Cholesterol"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Cholesterol (mg)", "Cholesterol"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Cholesterol (mg)", "Cholesterol"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Cholesterol (mg)", "Cholesterol"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Cholesterol (mg)", "Cholesterol"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Cholesterol (mg)", "Cholesterol"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Cholesterol (mg)", "Cholesterol"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Cholesterol (mg)", "Cholesterol"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Cholesterol (mg)", "Cholesterol"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Cholesterol (mg)", "Cholesterol"], milkType2Grams, 240);

    const sodium =
      getNutrientValue(thickenerWorksheet, thickener, ["Sodium (mg)", "Sodium"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Sodium (mg)", "Sodium"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Sodium (mg)", "Sodium"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Sodium (mg)", "Sodium"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Sodium (mg)", "Sodium"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Sodium (mg)", "Sodium"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Sodium (mg)", "Sodium"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Sodium (mg)", "Sodium"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Sodium (mg)", "Sodium"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Sodium (mg)", "Sodium"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Sodium (mg)", "Sodium"], milkType2Grams, 240);

    const totalCarbs =
      getNutrientValue(thickenerWorksheet, thickener, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Total Carbs. (g)", "Total Carbs", "Carbs (g)", "Carbohydrate (g)"], milkType2Grams, 240);

    const fiber =
      getNutrientValue(thickenerWorksheet, thickener, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Dietary Fiber (g)", "Fiber (g)", "Fiber"], milkType2Grams, 240);

    const sugar =
      getNutrientValue(thickenerWorksheet, thickener, ["Total Sugar (g)", "Sugar (g)", "Sugar"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Total Sugar (g)", "Sugar (g)", "Sugar"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Total Sugar (g)", "Sugar (g)", "Sugar"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Total Sugar (g)", "Sugar (g)", "Sugar"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Total Sugar (g)", "Sugar (g)", "Sugar"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Total Sugar (g)", "Sugar (g)", "Sugar"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Total Sugar (g)", "Sugar (g)", "Sugar"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Total Sugar (g)", "Sugar (g)", "Sugar"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Total Sugar (g)", "Sugar (g)", "Sugar"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Total Sugar (g)", "Sugar (g)", "Sugar"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Total Sugar (g)", "Sugar (g)", "Sugar"], milkType2Grams, 240);

    const protein =
      getNutrientValue(thickenerWorksheet, thickener, ["Protein (g)", "Protein"], thickenerData.amount) +
      getNutrientValue(thickenerWorksheet, thickener2, ["Protein (g)", "Protein"], thickener2Data.amount) +
      getNutrientValue(thickenerWorksheet, thickener3, ["Protein (g)", "Protein"], thickener3Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix1, ["Protein (g)", "Protein"], liquidMix1Data.amount) +
      getNutrientValue(flavorWorksheet, liquidMix2, ["Protein (g)", "Protein"], liquidMix2Data.amount) +
      getNutrientValue(sweetenerWorksheet, sweetener1, ["Protein (g)", "Protein"], sweetener1Data.amount, Number(sweetenerWorksheet[sweetener1]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(sweetenerWorksheet, sweetener2, ["Protein (g)", "Protein"], sweetener2Data.amount, Number(sweetenerWorksheet[sweetener2]?.["gram equivalent (of 1/2 cup)"] ?? 1), 1) +
      getNutrientValue(solidMixInWorksheet, mixIn1, ["Protein (g)", "Protein"], solidSimulated.amount1, Number(solidMixInWorksheet[mixIn1]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(solidMixInWorksheet, mixIn2, ["Protein (g)", "Protein"], solidSimulated.amount2, Number(solidMixInWorksheet[mixIn2]?.["grams (from cups)"] ?? 1)) +
      getNutrientValue(milkWorksheet, milkType1, ["Protein (g)", "Protein"], milkType1Grams, 240) +
      getNutrientValue(milkWorksheet, milkType2, ["Protein (g)", "Protein"], milkType2Grams, 240);

    const scale = 130 / sizeAmount;
    const servingsPerContainer = Math.max(1, Math.round((sizeSpec.amount ?? 130) / 130));

    return {
      calories: Math.round(calories),
      caloriesServing: Math.round(calories * scale),
      fat: Math.round(totalFat),
      fatServing: Math.round(totalFat * scale),
      cholesterol: Math.round(cholesterol),
      cholesterolServing: Math.round(cholesterol * scale),
      sodium: Math.round(sodium),
      sodiumServing: Math.round(sodium * scale),
      carbs: Math.round(totalCarbs),
      carbsServing: Math.round(totalCarbs * scale),
      fiber: Math.round(fiber),
      fiberServing: Math.round(fiber * scale),
      sugar: Math.round(sugar),
      sugarServing: Math.round(sugar * scale),
      protein: Math.round(protein),
      proteinServing: Math.round(protein * scale),
      servingSize: "2/3 cup (130g)",
      servingsPerContainer,
    };
  }, [
    flavorWorksheet,
    liquidMix1,
    liquidMix1Amount,
    liquidMix2,
    liquidMix2Amount,
    liquidSpecs,
    milkType1,
    milkType2,
    milkWorksheet,
    mixIn1,
    mixIn2,
    mixInAmount,
    selectedSize,
    sizeOptions,
    sizeSpecsDict,
    solidMixInWorksheet,
    solidSpecs,
    sweetener1,
    sweetener1Amount,
    sweetener2,
    sweetener2Amount,
    sweetenerWorksheet,
    sweetenerSpecs,
    thickener,
    thickener2,
    thickener2Amount,
    thickener3,
    thickener3Amount,
    thickenerSpecs,
    thickenerWorksheet,
  ]);

  useEffect(() => {
    setFlavorName(flavor?.name ?? "");

    if (!flavor || !premadeWorksheet[flavor.name]) {
      return;
    }

    const flavorRow = premadeWorksheet[flavor.name];
    const nextMilkType1 = String(flavorRow["Milk Type 1 (2/3)"] ?? "");
    const nextMilkType2 = String(flavorRow["Milk Type 2 (1/3)"] ?? "");

    const matchingBase = Object.entries(milkPreDoneMixesWorksheet).find(([, row]) => {
      const baseMilkType1 = String(row["Milk Type 1"] ?? "");
      const baseMilkType2 = String(row["Milk Type 2"] ?? "");
      return baseMilkType1 === nextMilkType1 && baseMilkType2 === nextMilkType2;
    });

    setIceCreamBase(matchingBase?.[0] ?? "");
    setMilkType1(nextMilkType1);
    setMilkType2(nextMilkType2);
    setThickener(String(flavorRow.Thickener ?? ""));
    setThickenerAmount(String(flavorRow["Thickener Amount (x tbsp)"] ?? "Auto"));
    setThickener2(String(flavorRow["Thickener 2"] ?? ""));
    setThickener2Amount(String(flavorRow["Thickener 2 Amount (x tbsp)"] ?? "Auto"));
    setThickener3(String(flavorRow["Thickener 3"] ?? ""));
    setThickener3Amount(String(flavorRow["Thickener 3 Amount (x tbsp)"] ?? "Auto"));
    setLiquidMix1(String(flavorRow["Liquid Mix 1"] ?? ""));
    setLiquidMix1Amount(String(flavorRow["Liquid Mix 1 Amount (x tbsp)"] ?? "1"));
    setLiquidMix2(String(flavorRow["Liquid Mix 2"] ?? ""));
    setLiquidMix2Amount(String(flavorRow["Liquid Mix 2 Amount (x tbsp)"] ?? "1"));
    setMixIn1(String(flavorRow["Solid Mix 1"] ?? ""));
    setMixIn2(String(flavorRow["Solid Mix 2"] ?? ""));
    setMixInAmount(String(flavorRow["Solid Mix Amount (% of all ice cream)"] ?? "15"));
    setSweetener1(String(flavorRow["Sweetner Type 1"] ?? ""));
    setSweetener1Amount(String(flavorRow["Sweetner Type 1 Amount (x 100g)"] ?? "1"));
    setSweetener2(String(flavorRow["Sweetner Type 2"] ?? ""));
    setSweetener2Amount(String(flavorRow["Sweetner Type 2 Amount (x 100g)"] ?? "1"));
    setQuantity(initialQuantity);
    setLactoseFree(initialLactoseFree);
    setSelectedSize(initialSize ?? sizeOptions[0] ?? "");
  }, [flavor, initialLactoseFree, initialQuantity, initialSize, milkPreDoneMixesWorksheet, premadeWorksheet, sizeOptions]);

  return (
    <ModalShell isOpen={isOpen} title="Customize Your Ice Cream!" onClose={onClose}>
      <div className="customize-layout">
        <div className="customize-form">
          <label>
            Name
            <input type="text" value={flavorName} onChange={(event) => setFlavorName(event.target.value)} placeholder="Flavor name" />
          </label>

          <MilkTypeSection
            iceCreamBase={iceCreamBase}
            baseGroups={iceCreamBaseGroups}
            milkType1={milkType1}
            milkType2={milkType2}
            milkGroups={milkGroups}
            getOptionPrice={(value, portion) => {
              if (!value) return 0;
              const milkData = new CalculationUtilities(upcharge).calculateMilkPrice(
                milkWorksheet,
                sizeSpecsDict,
                value,
                selectedSize,
                portion,
                0
              );
              return Number((milkData.price ?? 0).toFixed(2));
            }}
            onIngredientFocus={setActiveIngredientKey}
            onIceCreamBaseChange={setIceCreamBase}
            onMilkType1Change={setMilkType1}
            onMilkType2Change={setMilkType2}
          />

          <ThickenerSection
            thickener={thickener}
            thickener2={thickener2}
            thickener3={thickener3}
            thickenerAmount={thickenerAmount}
            thickener2Amount={thickener2Amount}
            thickener3Amount={thickener3Amount}
            optionGroups={thickenerGroups}
            amountOptions={thickenerAmountOptions}
            getOptionPrice={(value, amount) => getIngredientPrice(thickenerWorksheet, value, amount, "thickener")}
            onIngredientFocus={setActiveIngredientKey}
            onThickenerChange={setThickener}
            onThickener2Change={setThickener2}
            onThickener3Change={setThickener3}
            onThickenerAmountChange={setThickenerAmount}
            onThickener2AmountChange={setThickener2Amount}
            onThickener3AmountChange={setThickener3Amount}
          />

          <FlavorSection
            liquidMix1={liquidMix1}
            liquidMix2={liquidMix2}
            liquidMix1Amount={liquidMix1Amount}
            liquidMix2Amount={liquidMix2Amount}
            optionGroups={flavorGroups}
            amountOptions={liquidAmountOptions}
            getOptionPrice={(value, amount) => getIngredientPrice(flavorWorksheet, value, amount, "flavor")}
            onIngredientFocus={setActiveIngredientKey}
            onLiquidMix1Change={setLiquidMix1}
            onLiquidMix2Change={setLiquidMix2}
            onLiquidMix1AmountChange={setLiquidMix1Amount}
            onLiquidMix2AmountChange={setLiquidMix2Amount}
          />

          <MixInSection
            mixIn1={mixIn1}
            mixIn2={mixIn2}
            mixInAmount={mixInAmount}
            optionGroups={mixInGroups}
            amountOptions={mixInAmountOptions}
            getOptionPrice={(value, amount) => getIngredientPrice(solidMixInWorksheet, value, amount, "solid")}
            onIngredientFocus={setActiveIngredientKey}
            onMixIn1Change={setMixIn1}
            onMixIn2Change={setMixIn2}
            onMixInAmountChange={setMixInAmount}
          />

          <SweetenerSection
            sweetener1={sweetener1}
            sweetener2={sweetener2}
            sweetener1Amount={sweetener1Amount}
            sweetener2Amount={sweetener2Amount}
            optionGroups={sweetenerGroups}
            amountOptions={sweetenerAmountOptions}
            getOptionPrice={(value, amount) => getIngredientPrice(sweetenerWorksheet, value, amount, "sweetener")}
            onIngredientFocus={setActiveIngredientKey}
            onSweetener1Change={setSweetener1}
            onSweetener2Change={setSweetener2}
            onSweetener1AmountChange={setSweetener1Amount}
            onSweetener2AmountChange={setSweetener2Amount}
          />

          <section className="customize-section">
            <h5>Lactose Removal</h5>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={lactoseFree}
                onChange={(event) => setLactoseFree(event.target.checked)}
              />
              Make it lactose free?
            </label>
          </section>

          <section className="customize-section">
            <h5>Size</h5>
            <div className="size-grid">
              {sizeOptions.map((size) => (
                <label key={size} className={`size-pill ${selectedSize === size ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="customize-size"
                    value={size}
                    checked={selectedSize === size}
                    onChange={() => setSelectedSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </section>

          <section className="customize-section">
            <h5>Quantity</h5>
            <div className="quantity-stepper">
              <button type="button" className="ghost-button" onClick={() => setQuantity((count) => Math.max(1, count - 1))}>
                −
              </button>
              <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} />
              <button type="button" className="ghost-button" onClick={() => setQuantity((count) => count + 1)}>
                +
              </button>
            </div>
          </section>

          <label>
            Special Instructions
            <textarea rows={3} placeholder="Add any special instructions..." />
          </label>
        </div>

        <div className="customize-side-panel">
          <NutritionLabel
            collapsed={nutritionCollapsed}
            onToggle={() => setNutritionCollapsed((value) => !value)}
            nutrition={nutritionStats}
            totalPrice={ingredientPricing.subtotal}
            ingredientBreakdown={ingredientPricing.items}
            activeIngredientKey={activeIngredientKey}
            onIngredientHover={setActiveIngredientKey}
          />
        </div>
      </div>

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary-button small">
          Add to Cart
        </button>
      </div>
    </ModalShell>
  );
}

export default CustomizeModal;
