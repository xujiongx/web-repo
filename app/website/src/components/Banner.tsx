import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Banner() {
  return (
    <section
      id='home'
      className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 pt-16'
    >
      <div className='container mx-auto px-4 py-16'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className='text-4xl md:text-6xl font-bold mb-4'>
              你好 👋
              <br />
              我是<span className='text-primary'>Web开发者</span>
            </h1>
            <p className='text-gray-600 text-lg mb-8'>
              专注于创建美观、实用且高性能的web应用
            </p>
            <div className='space-x-4'>
              <a
                href='#contact'
                className='bg-primary  px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
              >
                联系我
              </a>
              <a
                href='#projects'
                className='border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/10 transition-colors'
              >
                查看作品
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className='relative h-[400px]'
          >
            <Image
              src='/banner.jpg'
              alt='banner'
              layout='fill'
              objectFit='contain'
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
