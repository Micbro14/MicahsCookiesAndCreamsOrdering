import * as XLSX from "xlsx";
import type { WorksheetDict, SizeSpec } from "../types";

export function parseHexJsonToWorkbook(hexJson: string): XLSX.WorkBook {
  const byteArray = new Uint8Array(
    hexJson.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  return XLSX.read(byteArray, { type: "array" });
}

export function worksheetToDict(workbook: XLSX.WorkBook, sheetName: string): WorksheetDict {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet["!ref"]) {
    return {};
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  const headers: string[] = [];
  const firstRow = range.s.r;
  const firstCol = range.s.c;

  for (let col = firstCol + 1; col <= range.e.c; col++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: firstRow, c: col })];
    if (cell?.v) headers.push(cell.v);
  }

  const result: WorksheetDict = {};

  for (let row = firstRow + 1; row <= range.e.r; row++) {
    const keyCell = sheet[XLSX.utils.encode_cell({ r: row, c: firstCol })];
    if (!keyCell?.v || keyCell.v.startsWith("__")) continue;

    const key = keyCell.v;
    result[key] = {};

    headers.forEach((header, index) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: firstCol + 1 + index })];
      result[key][header] = typeof cell?.v === "string" ? cell.v.trim() : cell?.v ?? null;
    });
  }

  return result;
}

export function fillSpecsDictionary(
  sheet: XLSX.WorkSheet,
  keyCol: string,
  valueCol: string
): Record<string, number> {
  const dict: Record<string, number> = {};

  for (let i = 2; i <= Object.keys(sheet).length; i++) {
    const keyCell = sheet[`${keyCol}${i}`];
    if (!keyCell?.v) continue;

    const valueCell = sheet[`${valueCol}${i}`];
    dict[String(keyCell.v)] = Number(valueCell?.v ?? 0);
  }

  return dict;
}

export function mapSizeSpecRows(rows: WorksheetDict): Record<string, SizeSpec> {
  const result: Record<string, SizeSpec> = {};

  for (const [key, row] of Object.entries(rows)) {
    if (!key || key.startsWith("__")) continue;

    result[key] = {
      id: String(key),
      name: String(key),
      amount: Number(row.Amount ?? 0),
      multiplier: Number(row.Multiplier ?? 0),
      containerCost: Number(row.ContainerCost ?? 0),
      additionalCost: Number(row.AdditionalCost ?? 0),
    };
  }

  return result;
}
