export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-36 bg-white/5 rounded-lg mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-3 w-48 bg-white/5 rounded" />
            </div>
            <div className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
