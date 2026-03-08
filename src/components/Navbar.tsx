export function Navbar() {
  return (
    <nav
      style={{ borderBottom: "1px solid #333333" }}
      className="w-full py-4"
    >
      <div className="max-w-[960px] mx-auto px-6 flex items-center justify-between">
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
            Metadata.COOL
          </span>
        </div>
      </div>
    </nav>
  );
}
