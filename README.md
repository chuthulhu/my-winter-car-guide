# My Winter Car 조립 가이드

[My Winter Car](https://store.steampowered.com/app/2799030/My_Winter_Car/) 게임의 차량 조립 과정을 단계별로 안내하는 웹 가이드입니다.

## 기능

- **단계별 가이드** — 엔진 조립, 차체 조립, 하부 조립 3개 카테고리
- **Google Sheets 연동** — 스프레드시트에서 실시간 데이터 로드
- **키보드 네비게이션** — ←/→ 화살표 키로 단계 이동
- **프로그레스 바** — 현재 진행 상황 시각 표시
- **탭별 데이터 캐싱** — 탭 전환 시 빠른 로딩

## 기술 스택

- **Next.js 16** (정적 출력 모드)
- **React 19**
- **TailwindCSS 4**
- **TypeScript**

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local)
NEXT_PUBLIC_SPREADSHEET_ID=your_spreadsheet_id

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 빌드

```bash
npm run build
```

`out/` 디렉토리에 정적 파일이 생성됩니다.
