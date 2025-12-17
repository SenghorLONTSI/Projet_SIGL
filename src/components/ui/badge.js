export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-800 ${className}`}>
      {children}
    </span>
  );
}
