export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-gray-900">
          Your Business Name
        </a>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="/services">Services</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a
            href="tel:+10000000000"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <span className="hidden md:inline">(000) 000-0000</span>
            <span className="md:hidden">Call</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
