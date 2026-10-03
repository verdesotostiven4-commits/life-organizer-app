export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10"
      aria-busy="true"
      aria-label="Cargando módulo"
    >
      <div className="mb-7">
        <div className="h-6 w-36 rounded-full bg-purple-100" />
        <div className="mt-3 h-10 w-[min(26rem,85%)] rounded-2xl bg-slate-200/80" />
        <div className="mt-3 h-4 w-[min(34rem,92%)] rounded-xl bg-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-3xl border border-purple-100/70 bg-white shadow-[0_6px_18px_rgba(76,29,149,0.035)]"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-3xl border border-slate-100 bg-white" />
        <div className="h-64 rounded-3xl border border-slate-100 bg-white" />
      </div>
    </main>
  );
}
