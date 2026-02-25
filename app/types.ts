export interface ScrewInfo {
  size: string;
  count: string;
}

export interface GuideStep {
  step: string;
  partName: string;
  screws: ScrewInfo[];
  note1: string;    // Column F (설명/팁)
  note2: string;    // Column G (추가 참고사항)
  imageUrl: string; // Column H (이미지 URL)
}
