export function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
      {children}
    </p>
  );
}
