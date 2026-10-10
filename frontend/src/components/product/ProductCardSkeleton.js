export default function ProductCardSkeleton({ count = 4 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="animate-pulse">
      <div className="aspect-[3/4] bg-zinc-200 dark:bg-zinc-800 rounded-none" />
      <div className="px-1 pt-2.5 pb-3 space-y-2">
        <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  ));
}
