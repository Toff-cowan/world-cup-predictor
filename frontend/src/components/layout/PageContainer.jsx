/**
 * Consistent page horizontal padding and max-width for all main content areas.
 */
export default function PageContainer({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 ${className}`}
    >
      {children}
    </div>
  );
}
