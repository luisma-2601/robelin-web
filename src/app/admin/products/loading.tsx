export default function ProductsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-9 w-40 bg-white/5 rounded-lg" />
        <div className="h-10 w-44 bg-white/5 rounded-lg" />
      </div>
      <div className="flex justify-end gap-3 mb-4">
        <div className="h-10 w-52 bg-white/5 rounded-full" />
        <div className="h-10 w-52 bg-white/5 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/5 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-white/5 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-20 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
