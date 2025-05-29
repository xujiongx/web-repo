'use client';

import Header from '@/components/Header';
import Banner from '@/components/Banner';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className='min-h-screen'>
      <Header />
      <Banner />
      <About />
      <Skills />
      <Footer />
    </main>
  );
}
