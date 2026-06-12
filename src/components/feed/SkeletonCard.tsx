export function SkeletonCard() {
  return (
    <div className="bg-white border-b border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded-full w-28" />
          <div className="h-2.5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
      <div className="w-full aspect-square bg-gray-100" />
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-16" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}
