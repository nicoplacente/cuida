export function DocumentIcon({ size = 24, ...props }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <path
        d="M7.25 3.75h6.9l3.6 3.6v12.9H7.25a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path d="M14 3.75V7.5h3.75M8.75 11h5.5M8.75 14.5h5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}
