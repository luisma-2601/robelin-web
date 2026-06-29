export default function ProfileLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-10 w-56 bg-white/5 rounded-lg mb-10 animate-pulse" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile card skeleton */}
        <div className="md:col-span-1">
          <div className="bg-[#111] border border-white/5 rounded-[30px] p-6 animate-pulse">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-white/5 rounded-full mb-4" />
              <div className="h-5 w-32 bg-white/5 rounded mb-2" />
              <div className="h-3 w-44 bg-white/5 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-28 bg-white/5 rounded" />
                  <div className="h-12 w-full bg-white/5 rounded-xl" />
                </div>
              ))}
              <div className="h-12 w-full bg-white/5 rounded-xl mt-6" />
            </div>
          </div>
        </div>

        {/* Orders skeleton */}
        <div className="md:col-span-2">
          <div className="bg-[#111] border border-white/5 rounded-[30px] p-6 md:p-8 animate-pulse">
            <div className="h-6 w-48 bg-white/5 rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center bg-black/40 border border-white/5 p-5 rounded-2xl">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-white/5 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div className="h-6 w-20 bg-white/5 rounded" />
                    <div className="h-5 w-24 bg-white/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
