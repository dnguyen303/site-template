export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-6 text-sm text-center space-y-2">
        <p className="text-white font-semibold">Your Business Name</p>
        <p>(000) 000-0000 &middot; your@email.com</p>
        <p>&copy; {new Date().getFullYear()} Your Business Name. All rights reserved.</p>
        <p className="text-xs text-gray-500 max-w-xl mx-auto">
          All prices are estimates. Services subject to availability.
          By submitting a form you consent to being contacted regarding your inquiry.
        </p>
      </div>
    </footer>
  );
}
