interface SpinnerProps {
  label?: string;
  className?: string;
}

const Spinner = ({ label = 'Loading', className = '' }: SpinnerProps) => {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;
