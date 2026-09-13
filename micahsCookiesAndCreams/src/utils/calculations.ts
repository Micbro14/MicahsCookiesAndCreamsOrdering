import type { SizeSpec, WorksheetDict, WorksheetRow } from "../types";

export type WorksheetMap = WorksheetDict;

export interface SegmentPriceResult {
  amount: number;
  price: number;
  thick: boolean;
  lactaseDrops: number;
}

export interface SolidPriceResult {
  cupAmount: number;
  price1: number;
  price2: number;
  amount1: number;
  amount2: number;
  gramsPerCup1: number;
  gramsPerCup2: number;
}

export interface MilkPriceResult {
  price: number;
  grams: number;
  lactaseDrops: number;
}

export interface CustomizationSelection {
  size: string;
  lactoseFree?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface PriceSummary {
  liquidMix1Data: SegmentPriceResult;
  liquidMix2Data: SegmentPriceResult;
  sweetener1Data: SegmentPriceResult;
  sweetener2Data: SegmentPriceResult;
  solidSimulated: SolidPriceResult;
  milkType1Price: number;
  milkType2Price: number;
  thickenerData: SegmentPriceResult;
  thickener2Data: SegmentPriceResult;
  thickener3Data: SegmentPriceResult;
  lactaseDrops: number;
  pricePerQuantity: number;
  totalPrice: number;
}

export class CalculationUtilities {
  private readonly upcharge: number;

  constructor(upcharge = 1) {
    this.upcharge = upcharge;
  }

  private getNumber(row: WorksheetRow | undefined, key: string, fallback = 0): number {
    const value = row?.[key];
    const numeric = typeof value === "number" ? value : Number(value ?? fallback);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  private getString(row: WorksheetRow | undefined, key: string): string {
    const value = row?.[key];
    return typeof value === "string" ? value : value != null ? String(value) : "";
  }

  private getSizeSpec(sizeSpecsDict: Record<string, SizeSpec>, size: string): SizeSpec {
    return sizeSpecsDict[size] ?? {
      id: size,
      name: size,
      amount: 0,
      multiplier: 1,
      containerCost: 0,
      additionalCost: 0,
    };
  }

  calculateSegmentPrice(
    worksheet: WorksheetMap,
    specsDict: Record<string, number>,
    sizeSpecsDict: Record<string, SizeSpec>,
    value: string,
    amountValue: string,
    size: string,
    milkAmount = 0,
    worksheetType: "flavor" | "thickener" | "sweetener" | "default" = "default"
  ): SegmentPriceResult {
    if (value === "" || amountValue === "" || !worksheet[value]) {
      return { amount: 0, price: 0, thick: false, lactaseDrops: 0 };
    }

    const row = worksheet[value];
    const amount = (specsDict[amountValue] ?? 0) * (this.getSizeSpec(sizeSpecsDict, size).multiplier ?? 1);
    const cost = this.getNumber(row, "Cost ($)");
    let price = amount * cost * this.upcharge;

    let thick = false;
    if (row && Object.prototype.hasOwnProperty.call(row, "Thick?")) {
      thick = this.getString(row, "Thick?") === "Yes";
    }

    let lactaseDrops = 0;
    if (Object.prototype.hasOwnProperty.call(row, "Lactose Drops Needed")) {
      lactaseDrops = this.getNumber(row, "Lactose Drops Needed") * 15;
    }

    let finalAmount = amount;

    if (worksheetType === "flavor" || (worksheetType === "thickener" && amountValue !== "Auto")) {
      finalAmount = amount * 15;
      if (Object.prototype.hasOwnProperty.call(row, "Lactose Drops Needed")) {
        lactaseDrops *= 15;
      }
    } else if (worksheetType === "sweetener") {
      const gramEquivalent = this.getNumber(row, "gram equivalent (of 1/2 cup)", 1);
      finalAmount = amount * gramEquivalent;
    } else if (worksheetType === "thickener" && amountValue === "Auto") {
      const gramsPer100gMilk = this.getNumber(row, "Amount per 100g of milk");
      finalAmount = (gramsPer100gMilk / 100) * milkAmount;
      price = (finalAmount / 15) * cost * this.upcharge;
    }

    return {
      amount: finalAmount,
      price: Number(price.toFixed(2)),
      thick,
      lactaseDrops,
    };
  }

  calculateSolidPrice(
    worksheet: WorksheetMap,
    specsDict: Record<string, number>,
    sizeSpecsDict: Record<string, SizeSpec>,
    value1: string,
    amountValue: string,
    size: string,
    value2?: string
  ): SolidPriceResult {
    let splitAmount = 0.5;

    if (value1 === "" || amountValue === "" || !worksheet[value1]) {
      return {
        cupAmount: 0,
        price1: 0,
        price2: 0,
        amount1: 0,
        amount2: 0,
        gramsPerCup1: 0,
        gramsPerCup2: 0,
      };
    }

    if (!value2 || !worksheet[value2]) {
      splitAmount = 1;
    }

    const sizeSpec = this.getSizeSpec(sizeSpecsDict, size);
    const cupAmount = (sizeSpec.amount ?? 0) * (specsDict[amountValue] ?? 0);

    const value1Row = worksheet[value1];
    const gramsPerCup1 = this.getNumber(value1Row, "grams (from cups)");
    const value1Grams = (cupAmount / 240) * gramsPerCup1 * splitAmount;
    const cost1 = this.getNumber(value1Row, "Cost ($)");
    const price1 = Number(((value1Grams / Math.max(gramsPerCup1, 1)) * this.upcharge * cost1).toFixed(2));

    let value2Grams = 0;
    let price2 = 0;
    let value2GramsPerCup = 0;

    if (value2 && worksheet[value2] && Object.prototype.hasOwnProperty.call(worksheet[value2], "grams (from cups)")) {
      const value2Row = worksheet[value2];
      value2GramsPerCup = this.getNumber(value2Row, "grams (from cups)");
      value2Grams = (cupAmount / 240) * value2GramsPerCup * splitAmount;
      const cost2 = this.getNumber(value2Row, "Cost ($)");
      price2 = Number(((value2Grams / Math.max(value2GramsPerCup, 1)) * this.upcharge * cost2).toFixed(2));
    }

    return {
      cupAmount,
      price1,
      price2,
      amount1: value1Grams,
      amount2: value2Grams,
      gramsPerCup1,
      gramsPerCup2: value2GramsPerCup,
    };
  }

  calculateMilkPrice(
    worksheet: WorksheetMap,
    sizeSpecsDict: Record<string, SizeSpec>,
    value: string,
    size: string,
    milkPortion: number,
    totalGramsBeforeMilk: number
  ): MilkPriceResult {
    if (value === "") {
      return { price: 0, grams: 0, lactaseDrops: 0 };
    }

    const row = worksheet[value];
    const sizeSpec = this.getSizeSpec(sizeSpecsDict, size);
    const grams = ((sizeSpec.amount ?? 0) - totalGramsBeforeMilk) * milkPortion;
    const cost = this.getNumber(row, "Cost ($)");
    const lactaseDropsNeeded = this.getNumber(row, "Lactose Drops Needed");
    const lactaseDrops = lactaseDropsNeeded * (grams / 240);
    const price = Number(((grams / 240) * cost * this.upcharge).toFixed(2));

    return { price, grams, lactaseDrops };
  }

  calculateCalories(
    amount: number,
    worksheet: WorksheetMap,
    value: string,
    fieldName: string,
    conversionFactor = 1
  ): number {
    if (!amount || !worksheet[value] || !worksheet[value][fieldName]) {
      return 0;
    }

    return (amount / conversionFactor) * Number(worksheet[value][fieldName]);
  }

  calculatePricePerQuantity(
    options: CustomizationSelection,
    prices: {
      liquidMix1Data: SegmentPriceResult;
      liquidMix2Data: SegmentPriceResult;
      sweetener1Data: SegmentPriceResult;
      sweetener2Data: SegmentPriceResult;
      solidSimulated: SolidPriceResult;
      milkType1Price: number;
      milkType2Price: number;
      thickenerData: SegmentPriceResult;
      thickener2Data: SegmentPriceResult;
      thickener3Data: SegmentPriceResult;
      lactaseDrops: number;
    },
    sizeSpecsDict: Record<string, SizeSpec>
  ): { pricePerQuantity: number; totalPrice: number } {
    const sizeSpec = this.getSizeSpec(sizeSpecsDict, options.size ?? "");
    const currentAdditionalCosts = (sizeSpec.additionalCost + sizeSpec.containerCost) * this.upcharge;
    const lactaseDropsCost = prices.lactaseDrops * (1 / 1) * this.upcharge;

    const pricePerQuantity =
      prices.milkType1Price +
      prices.milkType2Price +
      (prices.thickenerData.price || 0) +
      (prices.thickener2Data.price || 0) +
      (prices.thickener3Data.price || 0) +
      (prices.liquidMix1Data.price || 0) +
      (prices.liquidMix2Data.price || 0) +
      (prices.sweetener1Data.price || 0) +
      (prices.sweetener2Data.price || 0) +
      (prices.solidSimulated.price1 || 0) +
      (prices.solidSimulated.price2 || 0) +
      currentAdditionalCosts +
      (options.lactoseFree ? lactaseDropsCost : 0);

    const totalPrice = pricePerQuantity * 1;

    return {
      pricePerQuantity: Number(pricePerQuantity.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }

  calculateTotalCalories(
    _customFieldName: string,
    fieldName: string,
    size: string,
    thickener: SegmentPriceResult,
    thickenerValue: string,
    thickener2: SegmentPriceResult,
    thickener2Value: string,
    thickener3: SegmentPriceResult,
    thickener3Value: string,
    liquidMix1: SegmentPriceResult,
    liquidMix1Value: string,
    liquidMix2: SegmentPriceResult,
    liquidMix2Value: string,
    sweetener1: SegmentPriceResult,
    sweetener1Value: string,
    sweetener2: SegmentPriceResult,
    sweetener2Value: string,
    solidSimulated: SolidPriceResult,
    solid1Value: string,
    solid2Value: string,
    milkType1Grams: number,
    milk1Value: string,
    milkType2Grams: number,
    milk2Value: string,
    flavorWorksheet: WorksheetMap,
    sweetenerWorksheet: WorksheetMap,
    solidMixInWorksheet: WorksheetMap,
    milkWorksheet: WorksheetMap,
    sizeSpecsDict: Record<string, SizeSpec>
  ): number {
    let totalCalories = 0;

    const addFromRow = (worksheet: WorksheetMap, value: string, field: string, amount: number, conversionFactor = 15) => {
      if (!amount || !worksheet[value] || !worksheet[value][field]) return;
      totalCalories += (amount / conversionFactor) * Number(worksheet[value][field]);
    };

    addFromRow(worksheetForKey("thickener", flavorWorksheet, 0), thickenerValue, fieldName, thickener.amount, 15);

    if (thickener.amount && thickenerValue && flavorWorksheet[thickenerValue] && flavorWorksheet[thickenerValue][fieldName]) {
      totalCalories += (thickener.amount / 15) * Number(flavorWorksheet[thickenerValue][fieldName]);
    }

    if (thickener2.amount && thickener2Value && flavorWorksheet[thickener2Value] && flavorWorksheet[thickener2Value][fieldName]) {
      totalCalories += (thickener2.amount / 15) * Number(flavorWorksheet[thickener2Value][fieldName]);
    }

    if (thickener3.amount && thickener3Value && flavorWorksheet[thickener3Value] && flavorWorksheet[thickener3Value][fieldName]) {
      totalCalories += (thickener3.amount / 15) * Number(flavorWorksheet[thickener3Value][fieldName]);
    }

    if (liquidMix1.amount && liquidMix1Value && flavorWorksheet[liquidMix1Value] && flavorWorksheet[liquidMix1Value][fieldName]) {
      totalCalories += (liquidMix1.amount / 15) * Number(flavorWorksheet[liquidMix1Value][fieldName]);
    }

    if (liquidMix2.amount && liquidMix2Value && flavorWorksheet[liquidMix2Value] && flavorWorksheet[liquidMix2Value][fieldName]) {
      totalCalories += (liquidMix2.amount / 15) * Number(flavorWorksheet[liquidMix2Value][fieldName]);
    }

    if (sweetener1.amount && sweetener1Value && sweetenerWorksheet[sweetener1Value]) {
      const gramEquivalent = this.getNumber(sweetenerWorksheet[sweetener1Value], "gram equivalent (of 1/2 cup)", 1);
      if (sweetenerWorksheet[sweetener1Value][fieldName]) {
        totalCalories += (sweetener1.amount / gramEquivalent) * Number(sweetenerWorksheet[sweetener1Value][fieldName]);
      }
    }

    if (sweetener2.amount && sweetener2Value && sweetenerWorksheet[sweetener2Value]) {
      const gramEquivalent = this.getNumber(sweetenerWorksheet[sweetener2Value], "gram equivalent (of 1/2 cup)", 1);
      if (sweetenerWorksheet[sweetener2Value][fieldName]) {
        totalCalories += (sweetener2.amount / gramEquivalent) * Number(sweetenerWorksheet[sweetener2Value][fieldName]);
      }
    }

    if (solidSimulated.amount1 && solid1Value && solidMixInWorksheet[solid1Value] && solidMixInWorksheet[solid1Value]["grams (from cups)"] && solidMixInWorksheet[solid1Value][fieldName]) {
      totalCalories += (solidSimulated.amount1 / Number(solidMixInWorksheet[solid1Value]["grams (from cups)"])) * Number(solidMixInWorksheet[solid1Value][fieldName]);
    }

    if (solidSimulated.amount2 && solid2Value && solidMixInWorksheet[solid2Value] && solidMixInWorksheet[solid2Value]["grams (from cups)"] && solidMixInWorksheet[solid2Value][fieldName]) {
      totalCalories += (solidSimulated.amount2 / Number(solidMixInWorksheet[solid2Value]["grams (from cups)"])) * Number(solidMixInWorksheet[solid2Value][fieldName]);
    }

    if (milkType1Grams && milk1Value && milkWorksheet[milk1Value] && milkWorksheet[milk1Value][fieldName]) {
      totalCalories += (milkType1Grams / 240) * Number(milkWorksheet[milk1Value][fieldName]);
    }

    if (milkType2Grams && milk2Value && milkWorksheet[milk2Value] && milkWorksheet[milk2Value][fieldName]) {
      totalCalories += (milkType2Grams / 240) * Number(milkWorksheet[milk2Value][fieldName]);
    }

    let scaledValue = totalCalories * (130 / (sizeSpecsDict[size]?.amount ?? 130));

    if (fieldName.includes("Sodium")) {
      scaledValue *= 1000;
    }

    return Number(scaledValue.toFixed(0));
  }
}

function worksheetForKey(_key: string, fallback: WorksheetMap, _unused: number): WorksheetMap {
  return fallback;
}

export default CalculationUtilities;
