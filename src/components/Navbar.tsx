export function Navbar() {
  return (
    <nav
      style={{ borderBottom: "1px solid #333333" }}
      className="w-full px-6 py-4"
    >
      <div className="max-w-[960px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 grid grid-cols-2 gap-0.5"
            aria-hidden="true"
          >
            <div className="bg-accent rounded-sm" />
            <div className="bg-accent rounded-sm opacity-60" />
            <div className="bg-accent rounded-sm opacity-60" />
            <div className="bg-accent rounded-sm" />
          </div>
          <span className="text-white text-sm font-bold tracking-widest uppercase">
            FFprobe Online
          </span>
        </div>

        {/* Right side */}
        <a
          href="https://chunkify.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-dim text-xs tracking-wider hover:text-accent transition-colors"
        >
          ■ powered by chunkify
        </a>
      </div>
    </nav>
  );
}
