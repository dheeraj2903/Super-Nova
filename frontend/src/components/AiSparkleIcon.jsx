export default function AiSparkleIcon({
  size = 16,
  className = '',
  color = 'currentColor',
  fill = 'currentColor',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Primary crisp 4-point star */}
      <path
        d="M10 2.5C10 7.8 12.2 10 17.5 10C12.2 10 10 12.2 10 17.5C10 12.2 7.8 10 2.5 10C7.8 10 10 7.8 10 2.5Z"
        fill={fill}
      />
      {/* Companion mini star */}
      <path
        d="M19 13C19 15.6 20.1 16.7 22.7 16.7C20.1 16.7 19 17.8 19 20.4C19 17.8 17.9 16.7 15.3 16.7C17.9 16.7 19 15.6 19 13Z"
        fill={fill}
      />
    </svg>
  );
}
