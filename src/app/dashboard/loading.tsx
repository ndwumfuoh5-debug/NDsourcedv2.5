export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 w-16 bg-gray-100 rounded mb-3" />
              <div className="h-8 w-10 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-3 flex gap-6">
            {["Company", "Founder", "Sector", "Stage", "Round", "Status", "Submitted"].map((col) => (
              <div key={col} className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-gray-50 px-6 py-4 flex gap-6 items-center">
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
