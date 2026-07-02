export default function CartLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-10 w-40 bg-white/5 rounded-lg mb-8 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 bg-white/5 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-1/3 bg-white/5 rounded" />
                <div className="h-8 w-28 bg-white/5 rounded-lg" />
              </div>
              <div className="h-5 w-16 bg-white/5 rounded shrink-0" />
            </div>
          ))}
        </div>

        {/* Summary skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-5 w-32 bg-white/5 rounded" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-4 w-16 bg-white/5 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between">
              <div className="h-5 w-16 bg-white/5 rounded" />
              <div className="h-5 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
