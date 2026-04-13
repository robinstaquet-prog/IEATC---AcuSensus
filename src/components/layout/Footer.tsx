export function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div>
              <p className="text-slate-200 text-sm font-medium">AcuSensus</p>
              <p className="text-slate-500 text-xs">Plateforme de pensée clinique IEATC</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs">
            Usage pédagogique — Base de cas cliniques commentés
          </p>
        </div>
      </div>
    </footer>
  );
}
