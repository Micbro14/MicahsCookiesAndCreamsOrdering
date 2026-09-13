import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type * as XLSX from "xlsx";
import {
  fillSpecsDictionary,
  mapSizeSpecRows,
  parseHexJsonToWorkbook,
  worksheetToDict,
} from "../utils/dataParsers";
import type {
  SizeSpec,
  WorksheetDict,
  SpecsDictionary,
} from "../types";

export interface DataContextValue {
  workbook: XLSX.WorkBook | null;
  loading: boolean;
  error: string | null;
  milkWorksheet: WorksheetDict;
  milkPreDoneMixesWorksheet: WorksheetDict;
  thickenerWorksheet: WorksheetDict;
  flavorWorksheet: WorksheetDict;
  solidMixInWorksheet: WorksheetDict;
  sweetenerWorksheet: WorksheetDict;
  premadeWorksheet: WorksheetDict;
  sizeSpecsDict: Record<string, SizeSpec>;
  sizeOptions: string[];
  liquidSpecs: SpecsDictionary;
  thickenerSpecs: SpecsDictionary;
  solidSpecs: SpecsDictionary;
  sweetenerSpecs: SpecsDictionary;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const emptyWorksheetDict = (): WorksheetDict => ({}) as WorksheetDict;

const buildSizeSpecs = (specsWorksheet: XLSX.WorkSheet): Record<string, SizeSpec> => {
  const rawRows: WorksheetDict = {};

  for (let i = 2; i <= Object.keys(specsWorksheet).length; i += 1) {
    const sizeCell = specsWorksheet[`A${i}`];
    if (!sizeCell?.v) continue;

    const sizeName = String(sizeCell.v);
    if (sizeName.startsWith("_")) continue;

    rawRows[sizeName] = {
      Amount: specsWorksheet[`B${i}`]?.v ?? 0,
      Multiplier: specsWorksheet[`C${i}`]?.v ?? 0,
      ContainerCost: specsWorksheet[`V${i}`]?.v ?? 0,
      AdditionalCost: specsWorksheet[`Q${i}`]?.v ?? 0,
    };
  }

  return mapSizeSpecRows(rawRows);
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milkWorksheet, setMilkWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [milkPreDoneMixesWorksheet, setMilkPreDoneMixesWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [thickenerWorksheet, setThickenerWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [flavorWorksheet, setFlavorWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [solidMixInWorksheet, setSolidMixInWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [sweetenerWorksheet, setSweetenerWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [premadeWorksheet, setPremadeWorksheet] = useState<WorksheetDict>(emptyWorksheetDict());
  const [sizeSpecsDict, setSizeSpecsDict] = useState<Record<string, SizeSpec>>({});
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [liquidSpecs, setLiquidSpecs] = useState<SpecsDictionary>({});
  const [thickenerSpecs, setThickenerSpecs] = useState<SpecsDictionary>({});
  const [solidSpecs, setSolidSpecs] = useState<SpecsDictionary>({});
  const [sweetenerSpecs, setSweetenerSpecs] = useState<SpecsDictionary>({});

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/Ice-Cream-Master-Document.json");
      if (!response.ok) {
        throw new Error(`Failed to load workbook: ${response.status} ${response.statusText}`);
      }

      const hexText = await response.text();
      const parsedWorkbook = parseHexJsonToWorkbook(hexText);

      const nextMilkWorksheet = worksheetToDict(parsedWorkbook, "Milk Types Nutrition Per Cup");
      const nextMilkPreDoneMixesWorksheet = worksheetToDict(parsedWorkbook, "Pre Done Milk Mixes");
      const nextThickenerWorksheet = worksheetToDict(parsedWorkbook, "Thickener Nutrition");
      const nextFlavorWorksheet = worksheetToDict(parsedWorkbook, "Liquid Mix In Nutrition");
      const nextSolidMixInWorksheet = worksheetToDict(parsedWorkbook, "Solid Mix In Nutrition");
      const nextSweetenerWorksheet = worksheetToDict(parsedWorkbook, "Sweetener Mix In Nutrition");
      const nextPremadeWorksheet = worksheetToDict(parsedWorkbook, "Premade Flavors");
      const specsWorksheet = parsedWorkbook.Sheets["Specs"];

      const nextSizeSpecsDict = specsWorksheet ? buildSizeSpecs(specsWorksheet) : {};
      const nextSizeOptions = Object.keys(nextSizeSpecsDict);
      const nextLiquidSpecs = specsWorksheet ? fillSpecsDictionary(specsWorksheet, "D", "E") : {};
      const nextThickenerSpecs = specsWorksheet ? fillSpecsDictionary(specsWorksheet, "W", "X") : {};
      const nextSolidSpecs = specsWorksheet ? fillSpecsDictionary(specsWorksheet, "H", "I") : {};
      const nextSweetenerSpecs = specsWorksheet ? fillSpecsDictionary(specsWorksheet, "F", "G") : {};

      setWorkbook(parsedWorkbook);
      setMilkWorksheet(nextMilkWorksheet);
      setMilkPreDoneMixesWorksheet(nextMilkPreDoneMixesWorksheet);
      setThickenerWorksheet(nextThickenerWorksheet);
      setFlavorWorksheet(nextFlavorWorksheet);
      setSolidMixInWorksheet(nextSolidMixInWorksheet);
      setSweetenerWorksheet(nextSweetenerWorksheet);
      setPremadeWorksheet(nextPremadeWorksheet);
      setSizeSpecsDict(nextSizeSpecsDict);
      setSizeOptions(nextSizeOptions);
      setLiquidSpecs(nextLiquidSpecs);
      setThickenerSpecs(nextThickenerSpecs);
      setSolidSpecs(nextSolidSpecs);
      setSweetenerSpecs(nextSweetenerSpecs);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unknown data load error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<DataContextValue>(
    () => ({
      workbook,
      loading,
      error,
      milkWorksheet,
      milkPreDoneMixesWorksheet,
      thickenerWorksheet,
      flavorWorksheet,
      solidMixInWorksheet,
      sweetenerWorksheet,
      premadeWorksheet,
      sizeSpecsDict,
      sizeOptions,
      liquidSpecs,
      thickenerSpecs,
      solidSpecs,
      sweetenerSpecs,
      refresh,
    }),
    [workbook, loading, error, milkWorksheet, milkPreDoneMixesWorksheet, thickenerWorksheet, flavorWorksheet, solidMixInWorksheet, sweetenerWorksheet, premadeWorksheet, sizeSpecsDict, sizeOptions, liquidSpecs, thickenerSpecs, solidSpecs, sweetenerSpecs, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext(): DataContextValue {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }

  return context;
}

export default DataContext;
