export default function HomeLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20 animate-pulse">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="h-16 md:h-20 w-64 bg-white/5 rounded-lg mb-6" />
        <div className="h-5 w-80 bg-white/5 rounded mb-6" />
        <div className="h-10 w-72 bg-white/5 rounded-full" />
      </div>

      {/* Carousel */}
      <div className="w-full h-[500px] md:h-[600px] bg-white/5 rounded-[30px]" />

      {/* Catalog search */}
      <div className="space-y-6">
        <div className="h-14 max-w-3xl mx-auto w-full bg-white/5 rounded-full" />
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-white/5 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="aspect-square bg-white/5" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-20 bg-white/5 rounded" />
                <div className="h-5 w-36 bg-white/5 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="h-6 w-16 bg-white/5 rounded" />
                  <div className="w-10 h-10 bg-white/5 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
