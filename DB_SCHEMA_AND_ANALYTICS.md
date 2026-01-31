# 🗄️ 데이터베이스 및 데이터 수집 명세서

본 문서는 '회고 및 목표 달성 빙고 서비스'의 **데이터베이스 구조(Schema)**와 **사용자 로그 수집(Analytics)** 설계를 상세히 설명합니다.

---

## 📌 1. 개요 (Overview)
- **목적:** 사용자 행동 분석 및 서비스 개선을 위한 데이터 기반 마련
- **주요 변경점:**
    1. **로그 수집 시스템 구축**: 사용자 클릭, 공유, 다운로드 등 마이크로 인터랙션 추적
    2. **데이터 분석 강화**: 빙고판의 활성도(방문, 완료율)를 측정할 수 있는 지표 추가
    3. **사용자 관리 일원화**: 인증(Auth) 데이터와 프로필(Profile) 데이터 자동 동기화

---

## 📌 2. 테이블 구조 (Database Schema)

### A. `bingo_boards` (빙고 보드)
사용자가 생성한 빙고판의 핵심 데이터를 저장합니다. 이번 업데이트로 **성과 분석을 위한 정량적 지표**들이 추가되었습니다.

| 컬럼명 | 타입 | 설명 (Description) | 수집 시점 / 비고 |
|:---:|:---:|:---|:---|
| **visit_count** `[NEW]` | `INT` | **조회수** | 해당 빙고판 페이지 로딩 시 +1 증가 (예정) |
| **download_count** `[NEW]` | `INT` | **이미지 저장 횟수** | '이미지 저장' 버튼 클릭 시 +1 증가 |
| **final_filled_count** `[NEW]` | `INT` | **달성 완료 개수** | 빙고 칸이 채워진(Checked) 최종 개수 |
| **is_decorated** `[NEW]` | `BOOL` | **꾸미기 사용 여부** | 스티커/그리기 기능을 한 번이라도 썼는지 여부 |
| `grid_data` | `JSON` | 빙고 셀 텍스트 데이터 | 사용자가 입력한 목표 텍스트 (9칸 or 25칸) |
| `drawing_data` | `JSON` | 그리기/낙서 데이터 | 캔버스 위에 그린 선(Path) 좌표 정보 |
| `period_value` | `TEXT` | 목표 기간 (예: `2026-02`) | 빙고판 생성 시점의 타겟 월(Month) |

> **💡 PM Note:**
> `download_count`를 통해 어떤 빙고판이 **인기도(저장 가치)**가 높은지 파악할 수 있습니다.
> `is_decorated`를 통해 사용자들이 **꾸미기 기능**을 얼마나 적극적으로 사용하는지 검증할 수 있습니다.
> *(`share_count`는 `bingo_boards`에서 제거되었으며, `app_event_logs`의 `CLICK_SHARE_INTRO` 이벤트를 통해 전체 공유 횟수를 측정합니다.)*
> `is_decorated`를 통해 사용자들이 **꾸미기 기능**을 얼마나 적극적으로 사용하는지 검증할 수 있습니다.

---

### B. `app_event_logs` (행동 로그) `[NEW]`
Google Analytics(GA)와 별개로, **서버 DB에 영구 보존되는 정밀 행동 로그**입니다.

| 컬럼명 | 타입 | 설명 | 수집 데이터 예시 |
|:---:|:---:|:---|:---|
| `event_name` | `TEXT` | 이벤트 이름 | `CLICK_SHARE`, `BINGO_COMPLETED` |
| `event_params` | `JSON` | 상세 속성 | `{ "method": "kakaotalk", "grid_size": "3x3" }` |
| `user_id` | `UUID` | 사용자 ID | 로그인한 유저의 고유 식별자 |
| `created_at` | `TIME` | 발생 시각 | `2026-01-31 15:30:00+09` |

#### 📊 1. 공통 수집 데이터 (Global Context)
모든 이벤트 발생 시 아래 데이터가 **자동으로 함께 수집**됩니다.로그인 여부와 상관없이 수집되며, 비로그인 시 `user_id`는 null로 전송됩니다.

| 파라미터명 | 설명 | 예시 값 |
| :--- | :--- | :--- |
| `current_screen` | 현재 보고 있는 화면 경로 | `/bingo` |
| `previous_screen` | 직전에 머물렀던 화면 경로 | `/login` (없으면 빈 문자열) |
| `stay_duration` | 해당 화면에 머문 시간 (초) | `42` (42초 체류 후 이벤트 발생) |
| `user_id` | 사용자 고유 ID | `a1b2-c3d4...` (비로그인 시 `null`) |

#### 📊 2. 상세 행동 로그 목록

**A. 핵심 성과 (Conversion)**
| 이벤트명 (`event_name`) | 설명 | 주요 파라미터 (`event_params`) |
| :--- | :--- | :--- |
| **`CLICK_DOWNLOAD`** | 이미지 저장 시도 | `gridSize`, `isDecorated`, `period_type`, `filled_count` |
| **`CLICK_SAVE_BINGO`** | 내 빙고 리스트에 저장 | `gridSize`, `isDecorated`, `period_type`, `filled_count` |
| **`CLICK_START_BINGO`** | '내 빙고 만들기' 시작 | - |
| **`CLICK_SHARE_INTRO`** | 메인 하단 공유 버튼 | `method` (share_sheet_ios / clipboard) |

**B. 빙고판 인터랙션 (Interaction)**
| 이벤트명 | 설명 | 주요 파라미터 |
| :--- | :--- | :--- |
| **`CLICK_CELL`** | 빙고 셀(칸) 클릭/입력 | `index` (0~24), `gridSize` |
| **`CLICK_DRAWING_MODE`** | 그리기/꾸미기 모드 진입 | - |
| **`CLICK_YEARLY`** | 'Yearly' 탭 선택 | - |
| **`CLICK_MONTHLY`** | 'Monthly' 탭 선택 | - |
| **`CLICK_3x3` ... `5x5`** | 그리드 사이즈 변경 | - |
| **`CLICK_YEAR_PERIOD`** | 연도 선택 변경 | `year` (2026) |
| **`CLICK_MONTH_PERIOD`** | 월 선택 변경 | `month` (3) |

**C. 네비게이션 & 계정 (Navigation)**
| 이벤트명 | 설명 | 주요 파라미터 |
| :--- | :--- | :--- |
| **`CLICK_MENU_OPEN`** | 햄버거 메뉴 열기 | - |
| **`CLICK_HEADER_HOME`** | 상단 로고(홈) 클릭 | - |
| **`CLICK_HEADER_MY_BINGO`** | '내 빙고' 메뉴 클릭 | - |
| **`CLICK_HEADER_LOGIN`** | 로그인/회원가입 클릭 | - |
| **`CLICK_LOGIN_SUBMIT`** | 로그인 폼 제출 | - |
| **`CLICK_LOGOUT`** | 로그아웃 버튼 클릭 | - |
| **`CLICK_RESET_PASSWORD_LINK`** | 비밀번호 찾기 링크 클릭 | - |
| **`CLICK_RESET_PASSWORD_SUBMIT`** | 재설정 링크 발송 버튼 클릭 | `displayed_message` (화면 메시지) |
| **`CLICK_UPDATE_PASSWORD_SUBMIT`** | 비밀번호 변경 버튼 클릭 | `displayed_message` (화면 메시지) |

---

### C. `profiles` (사용자 프로필) `[NEW]`
회원가입한 사용자의 기본 정보를 관리합니다.

| 컬럼명 | 타입 | 설명 | 자동화 로직 (Trigger) |
|:---:|:---:|:---|:---|
| `email` | `TEXT` | 이메일 | 회원가입 시 `auth.users`에서 자동 복사 |
| `nickname` | `TEXT` | 닉네임 | 소셜 로그인 시 이름/별명 자동 추출 |

> **🔒 Security Note:**
> 사용자는 **본인의 프로필만** 조회 및 수정할 수 있도록 강력한 보안 정책(RLS)이 적용되어 있습니다.

---

## 📌 3. 데이터 보안 및 정책 (Security Policy)

전체 테이블에는 **RLS(Row Level Security)**가 적용되어 있어, API 키가 노출되어도 타인의 데이터를 훔쳐볼 수 없습니다.

1. **빙고판**: 본인이 만든 빙고판만 수정/삭제 보장. (조회는 공개 설정에 따라 가능할 수 있음)
2. **로그 데이터**:
   - **쓰기(Insert)**: 로그인한 사용자만 본인 ID로 로그 적재 가능.
   - **읽기(Select)**: **일반 사용자는 조회 불가** (관리자만 SQL 콘솔에서 확인 가능).
3. **프로필**: 오직 본인만 접근 가능.

---

## 📌 4. 활용 방안 (Action Items)

### 👨‍💻 개발자 (Developer)
- `app_event_logs` 테이블을 주기적으로 모니터링하여 에러율이나 어뷰징 패턴이 없는지 확인해주세요.
- 추후 '나의 지난달 빙고 모아보기' 기능을 만들 때 `period_value` 컬럼을 인덱싱하여 쿼리 성능을 최적화할 수 있습니다.

### 🎨 디자이너 (Designer)
- `is_decorated` 데이터 비율을 확인해 보세요. 꾸미기 기능 사용률이 낮다면 툴바 UI의 가시성을 높이는 개선안을 제안할 수 있습니다.
- `CLICK_DOWNLOAD` 횟수가 높은 빙고판 디자인(템플릿)을 분석하여 초기 기본 스타일을 개선할 수 있습니다.

### 💼 PM (Product Manager)
- `CLICK_START_BINGO` 대비 `CLICK_SAVE_BINGO` 비율(Funnel)을 계산하여 **빙고판 완성까지의 이탈률**을 점검하세요.
- `share_count`가 높은 유저군을 타겟으로 한 리워드 이벤트나 피처드(Featured) 노출을 기획할 수 있습니다.
