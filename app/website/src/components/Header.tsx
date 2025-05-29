import { useState } from 'react';
import Link from 'next/link';

const navigation = [
  { name: '首页', href: '#home' },
  { name: '关于我', href: '#about' },
  { name: '技能', href: '#skills' },
  { name: '项目', href: '#projects' },
  { name: '联系', href: '#contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='fixed w-full bg-white/80 backdrop-blur-sm shadow-sm z-50'>
      <nav className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='text-2xl font-bold text-primary'>
            <Link href='/'>My Portfolio</Link>
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:flex gap-8'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='text-gray-600 hover:text-primary transition-colors'
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16m-16 6h16'
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden mt-4 space-y-4'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='block text-gray-600 hover:text-primary transition-colors'
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
