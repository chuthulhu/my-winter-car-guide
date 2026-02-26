export interface ScrewInfo {
  size: string;
  count: string;
}

export interface GuideStep {
  step: string;
  partName: string;
  screws: ScrewInfo[];
  note1: string;         // Column E (설명/팁)
  note2: string;         // Column F (추가 참고사항)
  imageUrl: string;      // Column G (이미지 URL)
  partImageUrl: string[];  // Column H (부품 이미지 URL, /로 구분 시 최대 2개)
}
