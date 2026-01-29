import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="border-b border-button/30 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="font-heading text-xl font-bold hover:underline">
          ʻŌlelo Noʻeau Search
        </Link>
        <div className="flex gap-4 sm:gap-6">
          <Link href="/" className="link-text hover:underline text-sm sm:text-base">
            Home
          </Link>
          <Link href="/search" className="link-text hover:underline text-sm sm:text-base">
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
