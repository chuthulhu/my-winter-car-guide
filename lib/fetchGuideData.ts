import { GuideStep } from '@/app/types';

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

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID;

/**
 * Google Sheets의 gviz 공개 엔드포인트에서 탭(시트)별 가이드 데이터를 가져옵니다.
 *
 * gviz 응답은 `google.visualization.Query.setResponse({...});` 형태이므로
 * 앞 47글자와 뒤 2글자를 잘라내어 순수 JSON으로 파싱합니다.
 *
 * 참고: 스프레드시트 컬럼 매핑
 *   0: step, 1: partName, 2: screwSize, 3: screwCount, 4: (사용안함), 5: note1, 6: note2
 */
export async function fetchGuideData(tabName: string): Promise<GuideStep[]> {
  if (!SPREADSHEET_ID) {
    throw new Error('NEXT_PUBLIC_SPREADSHEET_ID 환경변수가 설정되지 않았습니다.');
  }

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  // gviz 응답: "/*O_o*/\ngoogle.visualization.Query.setResponse({...});"
  // 앞 47자("/*O_o*/\ngoogle.visualization.Query.setResponse(")와 뒤 2자(");")를 제거
  const jsonString = text.substring(47).slice(0, -2);

  const data: GvizResponse = JSON.parse(jsonString);
  const rows = data.table.rows;

  return rows
    .map((row: GvizRow) => {
      const c = row.c;
      if (!c) return null;

      return {
        step: c[0]?.f || c[0]?.v?.toString() || '',
        partName: c[1]?.v?.toString() || '',
        screwSize: c[2]?.f || c[2]?.v?.toString() || '-',
        screwCount: c[3]?.v?.toString() || '-',
        // c[4]는 현재 사용하지 않는 컬럼
        note1: c[5]?.v?.toString() || '',
        note2: c[6]?.v?.toString() || '',
      };
    })
    .filter((step): step is GuideStep => step !== null && step.step !== '');
}
