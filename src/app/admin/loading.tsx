export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-48 bg-white/5 rounded-lg mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-xl">
            <div className="h-4 w-28 bg-white/5 rounded mb-3" />
            <div className="h-8 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
