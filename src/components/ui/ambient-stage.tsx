export function AmbientStage() {
  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none", overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <g id="botanicalLeaf">
            <path
              d="M3 21 C5 12, 12 5, 21 3 C19 12, 12 19, 3 21 Z"
              fill="currentColor"
              fillOpacity="0.1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 21 L20 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path
              d="M9 15 L14 14 M13 11 L17 10 M8 16 L9 11 M12 12 L13 7"
              stroke="currentColor"
              strokeWidth="0.85"
              strokeLinecap="round"
            />
          </g>

          <g id="twinLeafEmblem">
            <path
              d="M12 13 C9 8, 4 5, 1 5 C2 9, 6 12, 12 13 Z"
              fill="currentColor"
              fillOpacity="0.18"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <path
              d="M12 13 C15 8, 20 5, 23 5 C22 9, 18 12, 12 13 Z"
              fill="currentColor"
              fillOpacity="0.18"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="1.4" fill="currentColor" />
          </g>

          <g id="botanicalSprig">
            <path
              d="M12 208 C54 156, 114 96, 198 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M46 168 C32 142, 42 114, 68 106 C64 134, 54 152, 46 168 Z"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path d="M46 168 L66 108" stroke="currentColor" strokeWidth="0.8" />
            <path
              d="M78 134 C104 144, 134 134, 144 108 C116 110, 96 120, 78 134 Z"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path d="M78 134 L142 109" stroke="currentColor" strokeWidth="0.8" />
            <path
              d="M114 98 C102 74, 112 48, 136 42 C132 68, 122 84, 114 98 Z"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="M148 66 C172 74, 194 64, 202 44 C180 46, 162 54, 148 66 Z"
              fill="currentColor"
              fillOpacity="0.12"
              stroke="currentColor"
              strokeWidth="1.1"
            />
            <path
              d="M166 48 C164 30, 178 16, 198 22 C192 40, 178 46, 166 48 Z"
              fill="currentColor"
              fillOpacity="0.15"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </g>
        </defs>
      </svg>

      <div className="ambient-stage" aria-hidden="true">
        <div className="ambient-aura" />
        <div className="moonlight-halo" />

        <svg
          className="botanical-contour-layer"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-60 210 C 260 110, 520 310, 860 200 C 1140 110, 1320 240, 1500 175"
            stroke="var(--contour-stroke)"
            strokeWidth="1.15"
          />
          <path
            d="M-60 248 C 280 148, 540 348, 880 238 C 1160 148, 1340 278, 1500 213"
            stroke="var(--contour-stroke)"
            strokeWidth="0.9"
            strokeDasharray="6 8"
          />
          <path
            d="M-60 660 C 240 560, 580 760, 920 640 C 1180 550, 1340 675, 1500 615"
            stroke="var(--contour-stroke)"
            strokeWidth="1.15"
          />
          <path
            d="M-60 698 C 260 598, 600 798, 940 678 C 1200 588, 1360 713, 1500 653"
            stroke="var(--contour-stroke)"
            strokeWidth="0.9"
            strokeDasharray="4 9"
          />

          <ellipse
            className="orbit-spin-slow"
            cx="720"
            cy="360"
            rx="430"
            ry="265"
            stroke="var(--contour-stroke)"
            strokeWidth="1"
            strokeDasharray="3 8"
          />
          <ellipse
            className="orbit-spin-reverse"
            cx="720"
            cy="360"
            rx="590"
            ry="360"
            stroke="var(--contour-stroke)"
            strokeWidth="0.9"
            strokeDasharray="1 10"
          />
        </svg>

        <svg className="corner-sprig sprig-tl" viewBox="0 0 220 220">
          <use href="#botanicalSprig" />
        </svg>
        <svg className="corner-sprig sprig-tr" viewBox="0 0 220 220" style={{ transform: "scaleX(-1)" }}>
          <use href="#botanicalSprig" />
        </svg>
        <svg className="corner-sprig sprig-br" viewBox="0 0 220 220" style={{ transform: "scale(-1,-1)" }}>
          <use href="#botanicalSprig" />
        </svg>

        <div className="stardust-layer">
          <span className="stardust" />
          <span className="stardust" />
          <span className="stardust" />
          <span className="stardust" />
          <span className="stardust" />
          <span className="stardust" />
        </div>

        <div className="ambient-dither" />
      </div>
    </>
  );
}
