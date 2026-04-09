export const PageLoadingPlaceholder = () => {
  return (
    <div className="animate-pulse space-y-8 px-4 sm:px-6">
      <section className="relative overflow-hidden rounded-b-4xl bg-[linear-gradient(135deg,_#36656B_0%,_#75B06F_100%)] px-6 pt-15 pb-8 text-white shadow-lg sm:px-8 sm:pt-8 sm:pb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,#ffffff26_0_2px,transparent_2.5px),radial-gradient(circle_at_75%_20%,#ffffff1c_0_2px,transparent_2.5px),radial-gradient(circle_at_55%_70%,#ffffff20_0_2px,transparent_2.5px)] bg-size-[160px_120px] opacity-20" />

        <div className="relative max-w-3xl pr-0 sm:pr-36">
          <div className="h-6 w-40 rounded-full bg-white/20" />
          <div className="mt-4 h-4 w-3/4 rounded-full bg-white/15" />
          <div className="mt-4 h-4 w-1/2 rounded-full bg-white/15" />

          <div className="mt-8 h-12 w-full max-w-xl rounded-2xl bg-white/20" />

          <div className="mt-6 flex flex-wrap gap-2.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-24 rounded-full bg-white/15 sm:w-28"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <div className="h-7 w-56 rounded-full bg-gray-200" />
          <div className="h-9 w-24 rounded-full bg-gray-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full bg-gray-200" />
              <div className="space-y-3 px-4 py-4">
                <div className="h-4 w-2/3 rounded-full bg-gray-200" />
                <div className="h-3 w-full rounded-full bg-gray-100" />
                <div className="h-3 w-5/6 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}