export function FolderIcon({ size = 24, ...props }) {
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
        d="M3.75 6.75A1.75 1.75 0 0 1 5.5 5h4.1l1.8 2H18.5a1.75 1.75 0 0 1 1.75 1.75v7.75a2.5 2.5 0 0 1-2.5 2.5H6.25a2.5 2.5 0 0 1-2.5-2.5V6.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
