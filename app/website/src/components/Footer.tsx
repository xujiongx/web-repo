import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">联系方式</h3>
            <ul className="space-y-2">
              <li>邮箱：your.email@example.com</li>
              <li>电话：+86 138 xxxx xxxx</li>
              <li>地址：中国，北京市</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="hover:text-primary transition-colors">
                  关于我
                </Link>
              </li>
              <li>
                <Link href="#skills" className="hover:text-primary transition-colors">
                  技能
                </Link>
              </li>
              <li>
                <Link href="#projects" className="hover:text-primary transition-colors">
                  项目
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">社交媒体</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} 个人作品集. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
