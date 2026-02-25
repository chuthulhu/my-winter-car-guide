import { GuideStep, ScrewInfo } from '@/app/types';

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
 * 나사 크기/개수 문자열을 파싱하여 ScrewInfo 배열로 변환합니다.
 *
 * 복수 나사인 경우 `/`로 구분합니다.
 * 예: "10mm / 12mm" + "4개 / 2개" → [{ size: "10mm", count: "4개" }, { size: "12mm", count: "2개" }]
 * 단일 나사: "10mm" + "4개" → [{ size: "10mm", count: "4개" }]
 */
function parseScrews(sizeRaw: string, countRaw: string): ScrewInfo[] {
  const sizes = sizeRaw.split('/').map((s) => s.trim()).filter(Boolean);
  const counts = countRaw.split('/').map((s) => s.trim()).filter(Boolean);

  if (sizes.length === 0 && counts.length === 0) {
    return [{ size: '-', count: '-' }];
  }

  const maxLen = Math.max(sizes.length, counts.length);
  const result: ScrewInfo[] = [];

  for (let i = 0; i < maxLen; i++) {
    result.push({
      size: sizes[i] || '-',
      count: counts[i] || '-',
    });
  }

  return result;
}

/**
 * Google Sheets IMAGE() 함수가 포함된 셀에서 이미지 URL을 추출합니다.
 *
 * gviz API 응답에서 =IMAGE("url") 셀은 여러 형태로 반환될 수 있습니다:
 *   1) v에 직접 URL 문자열 (드문 경우)
 *   2) f에 "IMAGE(\"url\")" 형태의 수식 텍스트
 *   3) v가 null이고 f에만 값이 있는 경우
 *
 * 이 함수는 모든 경우를 처리하여 순수 URL을 반환합니다.
 */
function parseImageUrl(cell: GvizCell | null | undefined): string {
  if (!cell) return '';

  // v 또는 f에서 raw 문자열 추출
  const raw = cell.v?.toString() || cell.f?.toString() || '';
  if (!raw) return '';

  // 이미 http(s):// URL이면 그대로 반환
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // IMAGE("url") 또는 IMAGE("url", ...) 형태에서 URL 추출
  const imageMatch = raw.match(/IMAGE\s*\(\s*"([^"]+)"/i);
  if (imageMatch) {
    return imageMatch[1];
  }

  // 그 외 문자열에서 http(s) URL 패턴 추출 시도
  const urlMatch = raw.match(/(https?:\/\/[^\s"')\]]+)/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  return '';
}

/**
 * Google Sheets의 gviz 공개 엔드포인트에서 탭(시트)별 가이드 데이터를 가져옵니다.
 *
 * gviz 응답은 `google.visualization.Query.setResponse({...});` 형태이므로
 * 앞 47글자와 뒤 2글자를 잘라내어 순수 JSON으로 파싱합니다.
 *
 * 스프레드시트 컬럼 매핑 (A~G):
 *   A(0): step, B(1): partName, C(2): screwSize, D(3): screwCount,
 *   E(4): note1(설명 및 팁), F(5): note2(추가 참고), G(6): imageUrl (IMAGE 함수 지원)
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
  // 앞 47자와 뒤 2자(");")를 제거
  const jsonString = text.substring(47).slice(0, -2);

  const data: GvizResponse = JSON.parse(jsonString);
  const rows = data.table.rows;

  return rows
    .map((row: GvizRow) => {
      const c = row.c;
      if (!c) return null;

      const sizeRaw = c[2]?.f || c[2]?.v?.toString() || '-';
      const countRaw = c[3]?.v?.toString() || '-';

      return {
        step: c[0]?.f || c[0]?.v?.toString() || '',
        partName: c[1]?.v?.toString() || '',
        screws: parseScrews(sizeRaw, countRaw),
        note1: c[4]?.v?.toString() || '',
        note2: c[5]?.v?.toString() || '',
        imageUrl: parseImageUrl(c[6]),
      };
    })
    .filter((step): step is GuideStep => step !== null && step.step !== '');
}
