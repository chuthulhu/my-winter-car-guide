'use server';

interface GuideStep {
  step: string;
  partName: string;
  screwSize: string;
  screwCount: string;
  note1: string; // Column F (비고1)
  note2: string; // Column G (비고2)
}

// Google Visualization API Response Interfaces
interface GvizCell {
  v: string | number | null;
  f?: string;
}

interface GvizRow {
  c: (GvizCell | null)[];
}

interface GvizTable {
  cols: { id: string; label: string; type: string }[];
  rows: GvizRow[];
}

interface GvizResponse {
  version: string;
  status: string;
  table: GvizTable;
}

export async function fetchGuideData(tabName: string): Promise<GuideStep[]> {
  // Use public gviz endpoint to avoid API Key issues
  // The tabName needs to be encoded
  const url = `https://docs.google.com/spreadsheets/d/1Y695S7q8HfNluMx3SPY33WFt_yd76XUZM9F7MNnDYg4/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    // Remove the prefix "/*O_o*/" and suffix ");" to get valid JSON
    const jsonString = text.substring(47).slice(0, -2);
    
    const data: GvizResponse = JSON.parse(jsonString);
    const rows = data.table.rows;

    const validSteps: GuideStep[] = rows.map((row: GvizRow) => {
        const c = row.c;
        if (!c) return null;

        return {
            step: c[0]?.f || c[0]?.v?.toString() || '',
            partName: c[1]?.v?.toString() || '',
            screwSize: c[2]?.f || c[2]?.v?.toString() || '-',
            screwCount: c[3]?.v?.toString() || '-',
            // Column F (Index 5) - Note 1
            note1: c[5]?.v?.toString() || '', 
            // Column G (Index 6) - Note 2
            note2: c[6]?.v?.toString() || '', 
        };
    }).filter((step: GuideStep | null): step is GuideStep => step !== null && step.step !== ''); // Filter out empty or null steps

    return validSteps;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    return [];
  }
}
