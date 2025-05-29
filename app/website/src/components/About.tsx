import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">关于我</h2>
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg">
              <p className="mb-4">
                你好！我是一名充满热情的全栈开发者，专注于创建出色的数字体验。我热爱将创意转化为代码，并始终保持对新技术的学习热情。
              </p>
              <p className="mb-4">
                在过去的几年里，我参与开发了多个大型项目，涉及前端和后端开发。我特别擅长使用 React、Next.js 和 Node.js 技术栈，同时也在不断学习和尝试新的技术框架。
              </p>
              <p>
                除了编程，我也热衷于分享技术知识，并积极参与开源社区。我相信技术可以改变世界，而我希望成为这个改变的一部分。
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
