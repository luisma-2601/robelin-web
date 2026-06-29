export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-32 bg-white/5 rounded-lg mb-6" />
      <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        ))}
        <div className="h-10 w-32 bg-white/5 rounded-xl mt-4" />
      </div>
    </div>
  );
}
