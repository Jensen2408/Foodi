export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.07)"}}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full shrink-0" style={{background:"rgba(255,255,255,0.08)"}} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded-full w-28" style={{background:"rgba(255,255,255,0.08)"}} />
          <div className="h-2.5 rounded-full w-20" style={{background:"rgba(255,255,255,0.05)"}} />
        </div>
      </div>
      <div className="w-full aspect-square" style={{background:"rgba(255,255,255,0.05)"}} />
      <div className="px-4 py-3 space-y-2">
        <div className="h-3 rounded-full w-16" style={{background:"rgba(255,255,255,0.08)"}} />
        <div className="h-3 rounded-full w-3/4" style={{background:"rgba(255,255,255,0.05)"}} />
        <div className="h-3 rounded-full w-1/2" style={{background:"rgba(255,255,255,0.05)"}} />
      </div>
    </div>
  );
}
