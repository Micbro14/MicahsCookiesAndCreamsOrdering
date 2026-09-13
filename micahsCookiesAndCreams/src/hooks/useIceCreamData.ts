// src/hooks/useIceCreamData.ts
import { useState, useEffect } from 'react';
import { hexToArrayBuffer } from '../utils/hexParser';
import type { FlavorSpec, SizeSpec } from '../types';
import JSZip from 'jszip'; // You would run: npm install jszip

export const useIceCreamData = () => {
  const [flavors] = useState<FlavorSpec[]>([]);
  const [sizes] = useState<SizeSpec[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        setLoading(true);
        // Fetch the hex text file outputted by your bash script
        const response = await fetch('/Ice-Cream-Master-Document.json');
        const hexText = await response.text();

        // Convert hex back to binary ZIP container
        const buffer = hexToArrayBuffer(hexText);

        // Use JSZip to read the Excel XML contents inside the browser
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(buffer);

        // Excel sheets are stored as XML inside xl/worksheets/sheet1.xml, etc.
        console.log("Successfully unpacked XLSM container:", Object.keys(zipContent.files));

        // TODO: Parse the target XML worksheet files into your FlavorSpec types

      } catch (err: any) {
        setError(err.message || 'Failed to parse Excel hex data');
      } finally {
        setLoading(false);
      }
    };

    loadExcelData();
  }, []);

  return { flavors, sizes, loading, error };
};