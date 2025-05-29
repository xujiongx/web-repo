import { motion } from 'framer-motion';

const skills = [
  {
    category: '前端开发',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js'],
  },
  {
    category: '后端开发',
    items: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API'],
  },
  {
    category: '开发工具',
    items: ['Git', 'VS Code', 'Docker', 'Webpack', 'Jest'],
  },
  {
    category: '其他技能',
    items: ['UI/UX Design', 'SEO', 'Performance Optimization', 'Agile', 'Team Leadership'],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">专业技能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {skillGroup.category}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.items.map((skill) => (
                    <li key={skill} className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
