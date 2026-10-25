const shimmer = 'rounded bg-zinc-200/70 motion-safe:animate-pulse'

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid auto-rows-fr grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col">
          <div className="aspect-square rounded-[1.4rem] bg-zinc-200/70 motion-safe:animate-pulse" />
          <div className={`mt-4 h-3 w-16 ${shimmer}`} />
          <div className={`mt-3 h-4 w-full ${shimmer}`} />
          <div className={`mt-2 h-4 w-2/3 ${shimmer}`} />
          <div className={`mt-5 h-6 w-24 ${shimmer}`} />
        </div>
      ))}
    </div>
  )
}
