const HERO_SRC = "/svg/competitive_programming_hero_svg.svg";

/**
 * Auth pages: form card on the left, hero illustration on the right (stacks on small screens).
 */
export default function AuthSplitLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-14">
        <section className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:justify-end lg:py-12 lg:pl-8 lg:pr-4 xl:pl-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
        <section
          className="flex w-full flex-1 items-center justify-center px-6 pb-12 pt-2 sm:px-8 lg:py-12 lg:pl-4 lg:pr-8 xl:pr-12"
          aria-label="Illustration"
        >
          <img
            src={HERO_SRC}
            alt="Competitive programming and coding practice"
            className="h-auto w-full max-w-md object-contain select-none lg:max-w-lg xl:max-w-xl"
            decoding="async"
          />
        </section>
      </div>
    </div>
  );
}
