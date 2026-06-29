export default function StoreInfoLoading() {
  return (
    <div className="animate-pulse max-w-3xl">
      <div className="h-9 w-64 bg-white/5 rounded-lg mb-6" />
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="h-5 w-40 bg-white/5 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-10 w-full bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-24 w-full bg-white/5 rounded-xl" />
            </div>
          </div>
        ))}
        <div className="h-12 w-44 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
