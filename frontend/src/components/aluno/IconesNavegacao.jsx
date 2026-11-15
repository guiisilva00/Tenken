export function IconeCasa({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3.5 10.5 8.5-7 8.5 7" fill="none" />
      <path d="M5.5 9v9.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V9Z" />
      <path d="M9.5 20v-5.5h5V20" fill="none" />
    </svg>
  );
}

export function IconeEquipamento({ className }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M8.5 20.5v-4a2 2 0 0 1 2-2h0M9.1 13l-1.2-2.7M8.1 7.1l4.6-1.8M16.5 4.8h2.1m0 0 1.4-1.4m-1.4 1.4L20 6.2"
        fill="none"
      />
      <path d="M8.5 20.5v-1a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1Z" />
      <path d="M4 20.5h16" fill="none" />
      <circle cx="10.5" cy="14.5" r="2" />
      <circle cx="6.5" cy="8.5" r="2" />
      <circle cx="15" cy="4.8" r="1.5" />
    </svg>
  );
}

export function IconeSeta({ className, direcao }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={
          direcao === "cima"
            ? "m3.5 10 4.5-4.5 4.5 4.5"
            : "m3.5 6 4.5 4.5L12.5 6"
        }
      />
    </svg>
  );
}
