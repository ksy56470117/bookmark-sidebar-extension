# 북마크 사이드바 Chrome Extension

웹페이지 위에 떠있는 북마크 사이드바. 어느 페이지에서든 북마크를 빠르게 열람할 수 있습니다.

![version](https://img.shields.io/badge/version-2.0-blue) ![manifest](https://img.shields.io/badge/manifest-v3-green)

---

## 기능

- **오버레이 사이드바** — 현재 페이지를 가리지 않고 위에 떠서 표시
- **폴더 트리** — Chrome 북마크 구조 그대로 펼쳐보기
- **검색** — 북마크 이름/URL 실시간 검색
- **투명도 조절** — -40 ~ +40 슬라이더로 배경 투명도 조정
- **블러 조절** — 배경 블러 강도 조정
- **너비 조절** — 사이드바 너비 조정
- **테마** — 라이트 / 다크 / 블루 / 그린 선택
- **설정 저장** — 닫아도 마지막 설정 유지

---

## 설치 방법 (개발자 모드)

> Chrome 웹 스토어 미출시 상태입니다. 아래 방법으로 직접 설치하세요.

1. 이 저장소를 클론 또는 ZIP 다운로드
   ```
   git clone https://github.com/ksy56470117/bookmark-sidebar-extension.git
   ```

2. Chrome 주소창에 `chrome://extensions` 입력

3. 우측 상단 **개발자 모드** 토글 ON

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. 다운로드한 폴더 선택

6. 설치 완료 — 툴바의 확장 아이콘을 클릭하면 사이드바가 열립니다

---

## 사용법

| 동작 | 설명 |
|------|------|
| 툴바 아이콘 클릭 | 사이드바 열기 / 닫기 |
| 폴더 클릭 | 북마크 폴더 펼치기 / 접기 |
| 북마크 클릭 | 현재 탭에서 열기 |
| 🔍 버튼 | 검색창 열기 |
| ⚙️ 버튼 | 설정 패널 열기 |

---

## 파일 구조

```
bookmark-extension/
├── manifest.json     # 확장 설정
├── background.js     # 북마크 API, 메시지 브로커
├── content.js        # 사이드바 렌더링 및 이벤트
├── sidebar.css       # 스타일
└── icons/            # 확장 아이콘
```

---

## 권한

| 권한 | 사용 이유 |
|------|-----------|
| `bookmarks` | Chrome 북마크 읽기 |
| `storage` | 사용자 설정 저장 |
| `scripting` | 페이지에 사이드바 삽입 |
| `activeTab` | 현재 탭에서 동작 |

---

## 요구사항

- Chrome 88 이상 (Manifest V3 지원)
