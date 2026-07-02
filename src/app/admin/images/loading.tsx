export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
      <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
