# Design System — 스마트 블로그

> 작성일: 2026-05-19
> 상태: 초안 (v0.1)

---

## 1. 컨셉

**1900년대 초반 작가의 원고 노트** + **살짝의 스팀펑크 액센트**.

햇살이 들어오는 작업실 책상 위, 만년필과 타자기와 황동 도구가 놓인 풍경. 종이는 변색됐고, 잉크는 sepia와 만년필 청잉크, 강조는 wax seal의 wine red. 산업혁명기 황동 부속이 살짝 끼어 있어 기계적 정밀함과 손의 흔적이 공존.

**적용 범위는 시각·분위기로만 한정.** 내부 식별자·변수명·LLM enum값·git/CLI 컨벤션은 영어 dev 관례 유지 (`draft`, `published`, `main`, `develop`, `feat:`, AI summary 등).

Phase 3a부터 **사용자에게 표시되는 UI 텍스트는 한국어**로 작성한다 — 워드마크(스마트 블로그), 페이지 제목(저장된 글 / 새 글 쓰기 / 글 편집 / 설정), 버튼(저장 / 발행 / 편집 / 취소 / 삭제 / 생성하기 / 새 글 쓰기), 폼 라벨(제목 / 요약 / 본문 / 저장소 / 브랜치 / 최근 커밋), status 표시(초안 / 발행됨), 토스트 메시지 전부. 내부 enum값(`draft` / `published`)은 영문 그대로 두되 PostCard 등 표시 지점에서 한국어로 매핑한다.

---

## 2. Primitive Tokens

값 정의. 의미 없음. 변경 비용이 큼.

### 2.1 색상

```css
:root {
  /* Paper — 종이, 변색된 cream */
  --paper-50:  #F2E4C2;  /* 가장 밝은 카드 */
  --paper-100: #E8DAB8;  /* 페이지 배경 */
  --paper-200: #DCC4A3;  /* 카드 깊은 톤 */
  --paper-300: #C6AC7C;  /* 썸네일 placeholder */
  --paper-400: #B89A6E;  /* 카드 border */
  --paper-500: #9C7F5C;  /* faint text, ornament */

  /* Ink — sepia 잉크 */
  --ink-50:    #6B4F35;  /* muted text */
  --ink-100:   #4A3520;  /* secondary text */
  --ink-200:   #2A1F12;  /* primary text, strong border */
  --ink-300:   #1A0F08;  /* deepest */

  /* Brass — 황동, 스팀펑크 액센트 */
  --brass-50:  #E8C078;  /* highlight */
  --brass-100: #C19A6B;  /* mid */
  --brass-200: #8B6F47;  /* base, ornament */
  --brass-300: #5A4220;  /* dark, depth */

  /* Wine — wax seal red, 강조 */
  --wine-50:   #A52525;  /* highlight */
  --wine-100:  #7A1A1A;  /* base */
  --wine-200:  #5A0F0F;  /* deep */
  --wine-300:  #3A0808;  /* border */

  /* Branch tints — semantic per branch */
  --branch-main-bg:    #D8BE92;
  --branch-feature-bg: #E2C0CC;
  --branch-develop-bg: #C5D4A6;
  --branch-main-text:    #2A1F12;
  --branch-feature-text: #4B1528;
  --branch-develop-text: #173404;
}
```

### 2.2 Typography family

```css
:root {
  /* Serif — 출판된 글 */
  --font-serif: "Lora", "Noto Serif KR", Georgia, "본명조", serif;

  /* Mono — 타자기, 시스템·메타데이터 */
  --font-mono: "Courier Prime", "Special Elite", "D2Coding", "나눔고딕코딩", monospace;

  /* Cursive — 만년필 손글씨, 즉흥적 표시 */
  --font-cursive: "Caveat", "Patrick Hand", "나눔손글씨 펜체", cursive;
}
```

Google Fonts에서 import. 한·영 fallback이 모두 같은 의미 결을 유지하게 페어링.

### 2.3 Type scale

| Token | Size | Line | Weight | Style | 용도 |
|---|---|---|---|---|---|
| `--text-display` | 32px | 1.0 | 500 | italic serif | 페이지 헤더 |
| `--text-h1` | 26px | 1.2 | 500 | italic serif | 주요 객체 제목 |
| `--text-brand` | 28px | 1.0 | 500 | italic serif | "Smart Blog" 워드마크 |
| `--text-h2` | 19px | 1.3 | 500 | italic serif | 카드 제목 |
| `--text-body` | 13.5px | 1.85 | 400 | serif | 글 본문 |
| `--text-preview` | 12px | 1.8 | 400 | serif | 카드 본문 미리보기 |
| `--text-label` | 11px | 1.0 | 500 | small-caps mono | UI 라벨, 섹션 헤더 |
| `--text-button` | 11px | 1.0 | 500 | small-caps mono | 버튼 |
| `--text-meta` | 10px | 1.0 | 400 | mono | 메타데이터, 캡션 |
| `--text-hand-label` | 14-16px | 1.4 | 400 | cursive | placeholder, 빈 상태 |
| `--text-stamp` | 14px | 1.0 | 500 | cursive | status 도장 |

`letter-spacing: 0.08–0.12em` for all small-caps mono labels (typewriter 결).

### 2.4 간격

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-9: 36px;
  --space-10: 40px;
}
```

### 2.5 Radius

종이는 안 둥글다. 라운드는 wax seal류와 황동 부속에만.

```css
:root {
  --radius-none: 0;       /* paper, card, input */
  --radius-sm: 2px;       /* wax seal button 모서리 */
  --radius-md: 3px;
  --radius-full: 50%;     /* 압정, 아이콘 */
}
```

### 2.6 Border

```css
:root {
  --border-hairline: 0.5px solid var(--paper-400);
  --border-strong:   1.5px solid var(--ink-200);
  --border-divider-double: 1px double rgba(74,53,32,0.45);
  --border-double-ink-thin: 1px double rgba(74,53,32,0.3);
  --border-active-nav: underline double 0.5px var(--wine-100);
}
```

### 2.7 Elevation (shadow)

```css
:root {
  /* 카드 raise — 종이가 책상에서 살짝 떠 있음 */
  --shadow-card: 4px 7px 14px rgba(74,53,32,0.22),
                 2px 3px 5px rgba(74,53,32,0.12);
  --shadow-card-inset: inset 0 0 30px rgba(184,140,90,0.06);

  /* 큰 paper (편집 영역) */
  --shadow-paper-large: 4px 8px 18px rgba(74,53,32,0.22),
                        2px 4px 6px rgba(74,53,32,0.12);
  --shadow-paper-inset: inset 0 0 40px rgba(184,140,90,0.06);

  /* 압정 — 종이를 뚫고 박힌 작은 황동 입체 */
  --shadow-pin: 0 3px 5px rgba(0,0,0,0.4),
                inset -1px -2px 3px rgba(0,0,0,0.3),
                inset 1px 1px 1px rgba(255,225,160,0.6);

  /* Wax seal 버튼 — emboss */
  --shadow-wax: 0 3px 6px rgba(0,0,0,0.25),
                inset 0 1px 1px rgba(255,200,180,0.18),
                inset 0 -1px 2px rgba(0,0,0,0.2);

  /* Input — inset 깊이 */
  --shadow-input: inset 0 1px 2px rgba(74,53,32,0.12);

  /* 작은 메모 카드 */
  --shadow-memo: 3px 5px 10px rgba(74,53,32,0.22),
                 1px 2px 4px rgba(74,53,32,0.12);
}
```

### 2.8 Paper grain (radial-gradient layered)

여러 미세한 radial gradient를 겹쳐 변색·얼룩의 인상을 만든다. 카드별 변주는 4가지 seed(`--grain-card-a/b/c/d`)를 만들어 PinnedSurface의 rotate variant에 매핑한다 (같은 카드는 같은 seed로 안정).

```css
/* 페이지 배경 */
--grain-page: 
  radial-gradient(ellipse at 12% 18%, rgba(155,110,70,0.10), transparent 40%),
  radial-gradient(ellipse at 88% 25%, rgba(184,140,90,0.09), transparent 35%),
  radial-gradient(ellipse at 65% 78%, rgba(120,82,45,0.08), transparent 40%),
  radial-gradient(ellipse at 25% 92%, rgba(184,140,90,0.07), transparent 32%);

/* 페이지 중앙 vignette — 가장자리만 살짝 어두워짐 */
--vignette-page: radial-gradient(ellipse at center, transparent 55%, rgba(74,53,32,0.10) 100%);

/* 카드 grain — 4개 seed (a/b/c/d), 작은 brown dot 2-3개씩 */
--grain-card-a: 
  radial-gradient(circle at 22% 32%, rgba(120,82,45,0.10), transparent 22%),
  radial-gradient(circle at 78% 18%, rgba(155,110,70,0.08), transparent 16%),
  radial-gradient(circle at 88% 82%, rgba(120,82,45,0.09), transparent 20%);
/* b/c/d: 같은 모양 다른 좌표 — primitive.css 참조 */
```

Phase 2 mockup에선 단일 grain만 적용됐던 걸 Phase 3a에서 (a) seed 4종으로 카드별 변주, (b) SVG noise(§6.1) layer 추가, (c) 페이지 vignette overlay, (d) 카드 가장자리 sepia inset 그림자(`--shadow-paper-edge`)까지 합성해 "바랜 종이" 결을 만든다.

### 2.9 Ruled paper

repeating-linear-gradient로 노트지 가로줄.

```css
/* 좌측 commit memo — 조밀한 노트 */
--ruled-memo: repeating-linear-gradient(
  transparent 0, transparent 19px,
  rgba(74,53,32,0.10) 19px, rgba(74,53,32,0.10) 20px
);

/* 우측 AI draft — 공식적인 편지지 */
--ruled-letter: repeating-linear-gradient(
  transparent 0, transparent 24px,
  rgba(74,53,32,0.10) 24px, rgba(74,53,32,0.10) 25px
);
```

본문 line-height를 ruled spacing과 일치시켜 글이 줄에 정확히 앉게 한다 (`line-height: 25px` for `--ruled-letter`).

### 2.10 Radial fills

특정 컴포넌트의 emboss/3D 결.

```css
/* Wax seal red */
--fill-wax: radial-gradient(circle at 32% 28%,
            var(--wine-50) 0%,
            var(--wine-100) 55%,
            var(--wine-200) 100%);

/* Brass pin */
--fill-pin-brass: radial-gradient(circle at 35% 30%,
                  var(--brass-50) 0%,
                  var(--brass-100) 35%,
                  var(--brass-200) 75%,
                  var(--brass-300) 100%);

/* Brass badge (commit SHA) */
--fill-brass-badge: linear-gradient(180deg,
                    #DDC290 0%, #C9AC78 100%);
```

---

## 3. Semantic Tokens

역할. "어디서 어떤 의도로 쓰이나." Primitive를 가리킨다. 의미를 흔들 일이 있으면 여기만 수정.

```css
:root {
  /* Surface */
  --color-surface-page:        var(--paper-100);
  --color-surface-card:        var(--paper-50);
  --color-surface-input:       var(--paper-50);
  --color-surface-inset:       var(--paper-100);
  --color-surface-thumbnail:   var(--paper-300);

  /* Text */
  --color-text-primary:    var(--ink-200);
  --color-text-secondary:  var(--ink-100);
  --color-text-muted:      var(--ink-50);
  --color-text-faint:      var(--paper-500);
  --color-text-on-wax:     var(--paper-50);
  --color-text-on-brass:   var(--ink-200);

  /* Border */
  --color-border-default:  var(--paper-400);
  --color-border-strong:   var(--ink-200);
  --color-border-divider:  rgba(74,53,32,0.45);

  /* Accent */
  --color-accent-wax:      var(--wine-100);   /* publish, active nav */
  --color-accent-brass:    var(--brass-200);  /* ornament, badges */
  --color-accent-ink:      var(--ink-200);    /* primary action */

  /* Branch */
  --color-branch-main-bg:    var(--branch-main-bg);
  --color-branch-main-text:  var(--branch-main-text);
  --color-branch-feature-bg: var(--branch-feature-bg);
  --color-branch-feature-text: var(--branch-feature-text);
  --color-branch-develop-bg: var(--branch-develop-bg);
  --color-branch-develop-text: var(--branch-develop-text);
}
```

---

## 4. Typography 위계 — 세 화자

폰트 가족이 곧 발화 주체. 의미는 한 가족 = 한 역할.

| Voice | Font | 의미 | 사용 자리 |
|---|---|---|---|
| **타자기 (mono)** | `--font-mono` | 시스템·기계·구조 | branch tag, commit SHA, author username, 날짜, 통계 수치, nav, 버튼 라벨, 섹션 헤더 라벨, 코드 |
| **본문 serif** | `--font-serif` | 출판된 글 | 페이지 헤더, 글 제목 (italic), 본문 body, summary 미리보기, 브랜드 워드마크 |
| **손글씨 cursive** | `--font-cursive` | 사람의 즉흥적 표시 | 편집기 placeholder, 빈 상태 메시지, AI draft 옆 짧은 첨언, status 도장, toast 알림 |

### 4.1 사용 규칙

- 한 화면에 cursive는 1–2자리 이내로 제한. 양적으로도 시각적으로도 sleep.
- 본문 body·정보성 메타데이터에는 cursive 절대 금지 (혼란).
- 모든 mono 라벨은 `small-caps + letter-spacing: 0.08em ~ 0.12em` (typewriter 활자 결).
- 모든 serif 제목은 `italic` (작가 손글씨가 활자화된 결).
- cursive는 살짝 기울이거나(stamp) 자유롭게(placeholder).

---

## 5. Component Patterns

> **호버 규칙 (전체 공통)** — 카드·메모·핀 surface에는 **hover transform 일절 금지** (rotate / scale / translate / wiggle / lift 전부 X). 카드의 정적 rotate는 "책상 위 종이"의 의도된 기울기로 유지된다. 허용되는 hover 표현은: `cursor: pointer`, 그리고 box-shadow의 **미세한** 깊이 변화 한 가지. 더 강하게 떠올리고 싶더라도 다른 수단으로 풀지 말 것.

### 5.1 Pinned Card

작은 종이 조각이 황동 압정으로 책상에 박힌 결.

```
- transform: rotate(-1.5° ~ 2°) 살짝 랜덤 (4 seed a/b/c/d)
- background: var(--color-surface-card) + var(--paper-noise-svg) + var(--grain-card-{seed})
- border: var(--border-hairline)
- box-shadow: var(--shadow-card), var(--shadow-card-inset), var(--shadow-paper-edge)
- padding: 22px 22px 18px
- position: relative
- 압정: absolute, 14px 원, --fill-pin-brass, --shadow-pin
- 압정 위치: top: -7px, left: 14px (Phase 3a부터 모든 PinnedSurface 동일 — top-left inset, 모서리 살짝 덮음)
```

압정 위치는 카드마다 변주하지 않는다. 사용자 테스트에서 압정이 카드 밖으로 떠 보이는 인스턴스가 있어 Phase 3a부터 모든 카드 top-left inset으로 통일. 카드별 변주는 rotate seed + grain seed가 책임진다.

좌측 작은 commit memo는 같은 패턴의 축소판: 12px pin (`--size-pin-sm`), --shadow-memo + --shadow-paper-edge, --ruled-memo 깔린 배경, 동일한 top-left 압정 위치.

### 5.1.1 Brass Pin (실제 황동 결)

평면 갈색이 아닌 진짜 황동 sphere 인상은 off-center radial-gradient로 만든다.

```css
.brass-pin {
  width: 14px; height: 14px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    var(--brass-highlight) 0%,  /* #F4E4A1 — 밝은 금 highlight */
    var(--brass-main) 30%,      /* #D4A442 — main brass */
    var(--brass-dark) 70%,      /* #8B6914 — dark brass */
    var(--brass-edge) 100%      /* #5C4A0F — edge */
  );
  box-shadow:
    0 2px 3px rgba(0,0,0,0.4),                /* drop */
    inset 1px 1px 1px rgba(255,255,255,0.3),  /* spec highlight */
    inset -1px -1px 2px rgba(0,0,0,0.3);      /* opposite-side shadow */
}
```

핵심은 `circle at 30% 30%`의 **off-center** highlight — 광원이 좌상에서 비치는 sphere의 인상을 만든다. center origin이면 평면 disc로 읽힌다.

### 5.2 Wax Seal Button (발행 / 저장 / 새 글 쓰기)

```
- background: --fill-wax
- color: var(--color-text-on-wax)
- border: 0.5px solid var(--wine-300)
- box-shadow: var(--shadow-wax)
- border-radius: var(--radius-sm)
- padding: 10px 22px (large) / 7px (compact)
- font: var(--text-button), letter-spacing: 0.12em, font-variant: small-caps
- 앞에 아이콘 1개 (ti-feather, ti-arrow-up 등)
```

### 5.3 Brass Gear Ornament

황동 톱니바퀴 액센트. 헤더·푸터에 작게.

```
- icon: <i class="ti ti-settings">
- color: var(--color-accent-brass)
- font-size: 18px (header) / 10px (footer)
- transform: rotate(15–18deg) — 일부러 살짝 비틀어서 기계 부속 느낌
- 헤더 워드마크 옆, 푸터 카피라이트 옆
```

### 5.4 Brass Commit SHA Badge

```
- background: --fill-brass-badge
- color: var(--color-text-on-brass)
- border: 0.5px solid var(--brass-200)
- box-shadow: 0 2px 3px rgba(74,53,32,0.15), inset 0 1px 1px rgba(255,235,200,0.4)
- padding: 5px 11px
- font: var(--text-meta), letter-spacing: 0.08em
```

### 5.5 Ruled Paper Surface

```
- 좌측 commit memo: background에 --ruled-memo + grain + base color
- 우측 AI draft: background에 --ruled-letter + grain + var(--color-surface-inset)
- 본문 line-height를 ruled spacing과 정확히 맞춤 (글이 줄 위에 앉음)
```

### 5.6 Status Stamp (cursive)

내부 enum `draft` / `published`를 한국어 표시 `초안` / `발행됨`으로 매핑해 손글씨 도장 결로 보여준다.

```
- font: var(--text-stamp), color: var(--color-accent-wax)
- transform: rotate(-6° ~ 4°)
- 카드 모서리 또는 헤더 옆
- 살짝 transparent (도장 잉크가 균일하지 않은 결)
- opacity: 0.85
```

### 5.7 Page Divider

```
- border-bottom: var(--border-divider-double)
- 페이지 헤더 nav 아래
```

### 5.8 Fleuron Ornament

```
- "✦ ❦ ✦" unicode glyph
- text-align: center, color: var(--color-accent-brass)
- font-size: 18px, letter-spacing: 1em
- 섹션 종결 또는 페이지 푸터 위
```

### 5.9 Form Input

```
- background: var(--color-surface-input)
- border: 0.5px solid var(--ink-50)
- box-shadow: var(--shadow-input)
- font: var(--font-mono), 12px
- padding: 8px 10px
- focus: border-color: var(--ink-200), 더 짙은 inset shadow
```

---

## 6. 도구 제약으로 mockup에 못 들어간 디테일 — 실제 구현 시 추가

### 6.1 진짜 paper grain (SVG noise) — Phase 3a 구현됨

radial-gradient layer 위에 SVG `feTurbulence` 노이즈를 data URI로 background-image에 합성. `--paper-noise-svg` 토큰으로 정의해 페이지·카드·메모·편집기 surface 합성에 모두 사용.

```css
--paper-noise-svg: url("data:image/svg+xml,%3Csvg ...%3E
  %3Cfilter id='n'%3E
    %3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E
    %3CfeColorMatrix values='0 0 0 0 0.30 0 0 0 0 0.22 0 0 0 0 0.15 0 0 0 0.10 0'/%3E
  %3C/filter%3E
  %3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E
%3C/svg%3E");
```

`stitchTiles="stitch"`로 타일 경계 솔기 제거. `numOctaves=2`로 grain을 살리되 과한 noise는 피함. alpha 0.10이라 가까이서만 보임.

### 6.2 폰트 import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?
  family=Lora:ital,wght@0,400..500;1,400..500
  &family=Noto+Serif+KR:wght@400;500
  &family=Courier+Prime:ital,wght@0,400;0,500;1,400
  &family=Caveat:wght@400..500
  &family=Nanum+Pen+Script
  &display=swap" rel="stylesheet">
```

### 6.3 Hover interaction

- **No hover transforms** — rotate / scale / translate / lift / wiggle 등 transform 변경 일절 금지 (§5 호버 규칙 참조). 사용자 테스트에서 카드 회전이 산만하다는 피드백이 있어 Phase 3a부터 제거됨.
- 압정 박힌 카드: hover 시 box-shadow만 미세하게 깊어짐 (cursor pointer + 작은 elevation 변화). transform 변경 없음.
- masking tape 디테일 (옵션): 정적 표현만, hover lift 없음.
- 활성 nav: 펜으로 그은 듯한 underline은 활성 상태 자체로 표시 (draw-in 애니메이션 옵션, 그러나 transform 금지).

### 6.4 Frayed paper edge

`clip-path: polygon(...)` 또는 SVG mask로 카드 모서리에 미세한 ragged edge.

### 6.5 잉크 splash / blot

작은 SVG 잉크 얼룩을 absolute position으로 한두 군데에 (AI draft 영역, 페이지 헤더 옆 등). 너무 많이 쓰면 산만.

### 6.6 Masking tape 디테일

크래프트지 결 색 (`#D4B888`)으로 카드 위쪽에 마스킹 테이프 한 줄. 너무 skeuomorphic하지 않게 한두 카드에만 변주로.

### 6.7 가스등 amber glow (선택)

hover 시 카드에 따뜻한 amber glow 살짝. 황동·sepia 톤과 어울림. 과하면 fantasy로 빠지니까 절제.

---

## 7. Open Questions

- **다크 모드**: 이 컨셉은 햇살 받은 종이 결이라 다크 모드가 메타포와 충돌. 옵션:
  1. 다크 모드 미지원 (싱글 모드)
  2. 다크 변형 만들기 — 가죽 표지 + 황금 잉크 + 등잔 amber. 별개의 디자인 시스템에 가까워짐.
- **한글-영문 손글씨 폰트 균형**: Caveat과 나눔손글씨 펜체가 굵기·기울기가 달라 함께 쓸 때 어색할 수 있음. 한국어 사용자가 많은 자리는 한글 폰트 단독으로 갈지 결정 필요.
- **압정 색상 variation**: 모든 압정이 동일한 황동이면 단조롭고, 색을 다양화하면 산만. 1차 결정: 단색 황동 통일.
- **status stamp의 색**: published = wine red, draft = brass? 또는 둘 다 wine red인데 draft는 더 옅게?
- **썸네일**: 현재 단색 paper-300으로 placeholder. 옵션: (a) 영구 placeholder, (b) LLM이 키워드 뽑아 vintage 사진 검색 (Unsplash + vintage tag), (c) 사용자가 직접 업로드. 현재 (a) 가정.

---

## 8. 변경 이력

- v0.1 (2026-05-19): 초안 작성
