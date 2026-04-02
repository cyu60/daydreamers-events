import { MoonLogo } from "./moon-logo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MoonLogo className="w-6 h-6 opacity-50" />
          <span className="text-sm text-dust">
            &copy; {new Date().getFullYear()} DayDreamers Academy
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://www.daydreamers-academy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-dust hover:text-ink transition-colors duration-150"
          >
            daydreamers-academy.com
          </a>
        </div>
      </div>
    </footer>
  );
}
