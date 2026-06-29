export default function OffersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-32 bg-white/5 rounded-lg mb-6" />
      <div className="h-10 w-36 bg-white/5 rounded-lg mb-6" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-4 h-4 bg-white/5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-white/5 rounded" />
              <div className="h-3 w-56 bg-white/5 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white/5 rounded-full" />
              <div className="w-8 h-8 bg-white/5 rounded-full" />
              <div className="w-8 h-8 bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
