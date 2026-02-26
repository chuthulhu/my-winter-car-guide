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
 * Google Drive 공유 링크도 자동 변환합니다:
 *   - drive.google.com/file/d/FILE_ID/...
 *   - drive.google.com/open?id=FILE_ID
 *   - drive.google.com/uc?id=FILE_ID&...
 *   - drive.google.com/thumbnail?id=FILE_ID&...
 *   → https://lh3.googleusercontent.com/d/FILE_ID
 */
function parseImageUrl(cell: GvizCell | null | undefined): string {
  if (!cell) return '';

  // v 또는 f에서 raw 문자열 추출
  const raw = cell.v?.toString() || cell.f?.toString() || '';
  if (!raw) return '';

  let url = '';

  // 이미 http(s):// URL이면 추출
  if (/^https?:\/\//i.test(raw)) {
    url = raw;
  } else {
    // IMAGE("url") 또는 IMAGE("url", ...) 형태에서 URL 추출
    const imageMatch = raw.match(/IMAGE\s*\(\s*"([^"]+)"/i);
    if (imageMatch) {
      url = imageMatch[1];
    } else {
      // 그 외 문자열에서 http(s) URL 패턴 추출 시도
      const urlMatch = raw.match(/(https?:\/\/[^\s"')\]]+)/i);
      if (urlMatch) {
        url = urlMatch[1];
      }
    }
  }

  if (!url) return '';

  // Google Drive URL → 직접 이미지 URL 변환
  url = convertGoogleDriveUrl(url);

  // Fandom/Wikia 이미지 URL → 임베딩 가능한 URL 변환
  url = convertFandomImageUrl(url);

  return url;
}

/**
 * Google Drive 공유/직통 링크를 직접 이미지 표시가 가능한 URL로 변환합니다.
 *
 * thumbnail API (?sz=w2000)를 사용하여 올바른 Content-Type 헤더로 이미지를 서빙합니다.
 * lh3.googleusercontent.com URL은 ORB(Opaque Response Blocking)에 의해
 * 차단될 수 있으므로 thumbnail API로 통일합니다.
 */
function convertGoogleDriveUrl(url: string): string {
  let fileId = '';

  // lh3.googleusercontent.com/d/FILE_ID 형태
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) {
    fileId = lh3Match[1];
  }

  // drive.google.com/file/d/FILE_ID/... 형태
  if (!fileId) {
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    }
  }

  // drive.google.com/open?id=FILE_ID, uc?id=FILE_ID, thumbnail?id=FILE_ID 형태
  if (!fileId) {
    const idMatch = url.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?.*?id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    // thumbnail API: 올바른 image/* Content-Type으로 응답하여 ORB 차단 방지
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
  }

  // Google Drive가 아닌 URL은 그대로 반환
  return url;
}

/**
 * Fandom/Wikia 이미지 URL을 img 태그에서 로드 가능한 형태로 변환합니다.
 *
 * static.wikia.nocookie.net 이미지는 브라우저 주소창에서는 보이지만
 * img 태그에서는 핫링킹 방지로 차단됩니다.
 * images.weserv.nl 프록시를 통해 서버 측에서 이미지를 가져오면 해결됩니다.
 */
function convertFandomImageUrl(url: string): string {
  if (!url.includes('static.wikia.nocookie.net')) {
    return url;
  }

  // weserv.nl 이미지 프록시를 통해 핫링킹 차단 우회
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

/**
 * H열 부품 이미지 셀을 /로 분리하여 최대 2개의 URL 배열로 반환합니다.
 * 각 URL은 parseImageUrl을 통해 정규화됩니다.
 */
function parsePartImageUrls(cell: GvizCell | null | undefined): string[] {
  if (!cell) return [];
  const raw = cell.v?.toString() || cell.f?.toString() || '';
  if (!raw) return [];

  // / 구분자로 분리 (URL 내부 슬래시와 구별하기 위해 공백+/+공백 또는 양쪽 공백 패턴 우선)
  // 단순 split은 URL을 깨뜨리므로, 셀에 여러 URL이 있을 때는
  // http로 시작하는 패턴 기준으로 분리
  const urls = raw.split(/\s*\/\s*(?=https?:)/i);

  return urls
    .slice(0, 2) // 최대 2개
    .map(u => {
      // 개별 URL에 대해 parseImageUrl과 동일한 처리
      const trimmed = u.trim();
      if (!trimmed) return '';
      const fakeCell = { v: trimmed } as GvizCell;
      return parseImageUrl(fakeCell);
    })
    .filter(u => u !== '');
}

/**
 * Google Sheets의 gviz 공개 엔드포인트에서 탭(시트)별 가이드 데이터를 가져옵니다.
 *
 * gviz 응답은 `google.visualization.Query.setResponse({...});` 형태이므로
 * 앞 47글자와 뒤 2글자를 잘라내어 순수 JSON으로 파싱합니다.
 *
 * 스프레드시트 컬럼 매핑 (A~H):
 *   A(0): step, B(1): partName, C(2): screwSize, D(3): screwCount,
 *   E(4): note1(설명 및 팁), F(5): note2(추가 참고), G(6): imageUrl, H(7): partImageUrl
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
        partImageUrl: parsePartImageUrls(c[7]),
      };
    })
    .filter((step): step is GuideStep => step !== null && step.step !== '');
}
