export function EyeOffIcon({ size = 20, ...props }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <path d="m3 3 18 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path
        d="M10.6 6.1A10.3 10.3 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.7M6.5 7.5A17 17 0 0 0 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.9-.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M10.2 10.2a2.5 2.5 0 0 0 3.6 3.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
