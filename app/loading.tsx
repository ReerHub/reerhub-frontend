export default function Loading() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="skeleton h-9 w-64 rounded-lg mb-3" />
      <div className="skeleton h-4 w-96 max-w-full rounded mb-10" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#0B1A33] border border-[#E2E8F0] dark:border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton w-12 h-12 rounded-[10px]" />
              <div className="flex-1">
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
            <div className="skeleton h-3.5 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
