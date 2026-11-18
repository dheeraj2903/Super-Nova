/* Inline SVG symbol library — identical to the design reference */
export default function SVGDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4B5563" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="gb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9A7A52" />
          <stop offset="1" stopColor="#5A4229" />
        </linearGradient>

        <symbol id="s-head" viewBox="0 0 120 120">
          <ellipse cx="60" cy="108" rx="40" ry="5" fill="#111827" opacity=".1" />
          <path d="M26 74V58a34 34 0 0168 0v16" fill="none" stroke="#1F2937" strokeWidth="7" strokeLinecap="round" />
          <rect x="16" y="64" width="24" height="38" rx="12" fill="url(#gd)" />
          <rect x="80" y="64" width="24" height="38" rx="12" fill="url(#gd)" />
          <rect x="22" y="72" width="8" height="22" rx="4" fill="#B8956A" />
          <rect x="90" y="72" width="8" height="22" rx="4" fill="#B8956A" />
        </symbol>

        <symbol id="s-watch" viewBox="0 0 120 120">
          <rect x="42" y="4" width="36" height="34" rx="8" fill="#6B5237" />
          <rect x="42" y="82" width="36" height="34" rx="8" fill="#6B5237" />
          <rect x="28" y="28" width="64" height="64" rx="18" fill="url(#gd)" />
          <rect x="34" y="34" width="52" height="52" rx="13" fill="#0B1220" />
          <circle cx="60" cy="60" r="18" fill="none" stroke="#B8956A" strokeWidth="4" />
          <path d="M60 49v11l8 4" stroke="#F9FAFB" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="92" y="50" width="4" height="14" rx="2" fill="#6B7280" />
        </symbol>

        <symbol id="s-shoe" viewBox="0 0 120 120">
          <ellipse cx="60" cy="104" rx="46" ry="5" fill="#111827" opacity=".1" />
          <path d="M10 84c0-9 4-13 11-15l13-4c6-2 8-9 9-15 7 3 14 6 22 8 11 3 25 6 34 11 7 4 9 9 9 15v4H10z" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2" />
          <path d="M34 65c8 6 18 9 30 10" stroke="#7E6140" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M52 50l4 6M60 53l4 6" stroke="#A8A29E" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="8" y="86" width="104" height="12" rx="6" fill="#111827" />
          <rect x="8" y="86" width="104" height="4" rx="2" fill="#E5E2DC" />
        </symbol>

        <symbol id="s-bag" viewBox="0 0 120 120">
          <ellipse cx="60" cy="108" rx="36" ry="4" fill="#111827" opacity=".1" />
          <path d="M44 34c0-14 6-22 16-22s16 8 16 22" fill="none" stroke="#5A4229" strokeWidth="6" strokeLinecap="round" />
          <rect x="26" y="30" width="68" height="76" rx="22" fill="url(#gb)" />
          <rect x="38" y="62" width="44" height="30" rx="10" fill="#7E6140" stroke="#5A4229" strokeWidth="2" />
          <path d="M38 72h44" stroke="#5A4229" strokeWidth="2" />
          <rect x="54" y="66" width="12" height="5" rx="2.5" fill="#E8D9C0" />
          <path d="M34 46h52" stroke="#C9AE86" strokeWidth="2" strokeDasharray="3 3" opacity=".7" />
        </symbol>

        <symbol id="s-lamp" viewBox="0 0 120 120">
          <ellipse cx="60" cy="108" rx="30" ry="5" fill="#111827" opacity=".12" />
          <rect x="38" y="100" width="44" height="8" rx="4" fill="url(#gd)" />
          <path d="M60 100V62L82 34" stroke="#374151" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M70 14l30 24-12 10-28-24z" fill="#B8956A" />
          <path d="M70 46l-6 28M86 52l8 22" stroke="#F3E3C7" strokeWidth="2" opacity=".5" />
        </symbol>

        <symbol id="s-wallet" viewBox="0 0 120 120">
          <ellipse cx="60" cy="100" rx="42" ry="4" fill="#111827" opacity=".1" />
          <rect x="16" y="32" width="88" height="62" rx="10" fill="url(#gb)" />
          <rect x="16" y="32" width="88" height="22" rx="10" fill="#8A6A45" />
          <rect x="72" y="58" width="32" height="20" rx="6" fill="#4A3622" />
          <circle cx="84" cy="68" r="4" fill="#E8D9C0" />
          <path d="M22 40h76" stroke="#E8D9C0" strokeWidth="1.5" strokeDasharray="3 3" opacity=".7" />
        </symbol>

        <symbol id="s-buds" viewBox="0 0 120 120">
          <ellipse cx="60" cy="104" rx="40" ry="4" fill="#111827" opacity=".1" />
          <rect x="26" y="50" width="68" height="50" rx="22" fill="#FFFFFF" stroke="#D6D3CD" strokeWidth="2" />
          <path d="M26 72h68" stroke="#E5E2DC" strokeWidth="2" />
          <circle cx="60" cy="86" r="3" fill="#7E6140" />
          <ellipse cx="44" cy="34" rx="11" ry="14" fill="#111827" />
          <rect x="40" y="40" width="7" height="22" rx="3.5" fill="#111827" />
          <ellipse cx="76" cy="34" rx="11" ry="14" fill="#111827" />
          <rect x="73" y="40" width="7" height="22" rx="3.5" fill="#111827" />
        </symbol>

        <symbol id="s-vase" viewBox="0 0 120 120">
          <ellipse cx="60" cy="108" rx="30" ry="4" fill="#111827" opacity=".1" />
          <path d="M48 40c0-6 4-8 4-14h16c0 6 4 8 4 14 12 8 16 22 14 40-1 14-10 26-26 26S35 94 34 80c-2-18 2-32 14-40z" fill="#E8DFCF" stroke="#D6CBB6" strokeWidth="2" />
          <path d="M60 26C58 14 52 8 46 4M60 26c3-12 10-18 18-20M60 26c0-8 2-14 8-20" stroke="#6B7A4F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="46" cy="5" rx="4" ry="2.5" fill="#6B7A4F" />
          <ellipse cx="78" cy="6" rx="4" ry="2.5" fill="#6B7A4F" />
          <path d="M42 76c10 6 26 6 36 0" stroke="#B8956A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </symbol>

        <symbol id="s-spark" viewBox="0 0 24 24">
          <path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" />
          <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
        </symbol>
      </defs>
    </svg>
  );
}
