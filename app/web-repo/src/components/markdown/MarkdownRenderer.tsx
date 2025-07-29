import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { marked, MarkedOptions } from "marked";
import DOMPurify from "dompurify";
import mermaid from "mermaid";
import hljs from "highlight.js";
import { Card, Alert, Spin } from "@arco-design/web-react";
import "highlight.js/styles/github.css";

export interface MarkdownRendererProps {
  /** Markdown内容 */
  content: string;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 容器样式 */
  style?: React.CSSProperties;
  /** 容器类名 */
  className?: string;
  /** Mermaid主题 */
  mermaidTheme?: "default" | "dark" | "forest" | "neutral";
  /** 是否启用代码高亮 */
  enableHighlight?: boolean;
  /** 是否启用Mermaid渲染 */
  enableMermaid?: boolean;
  /** 自定义渲染器配置 */
  markedOptions?: MarkedOptions;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  bordered = true,
  style,
  className,
  mermaidTheme = "default",
  enableHighlight = true,
  enableMermaid = true,
  markedOptions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedContent, setRenderedContent] = useState("");
  const [mermaidInitialized, setMermaidInitialized] = useState(false);
  const renderingRef = useRef(false);
  const mermaidCounterRef = useRef(0);

  // 初始化Mermaid
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (enableMermaid) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          securityLevel: 'loose',
          fontFamily: 'monospace',
          logLevel: 'error',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 15
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            useMaxWidth: true
          },
          gantt: {
            titleTopMargin: 25,
            barHeight: 20,
            fontSize: 11,
            gridLineStartPadding: 35,
            leftPadding: 75,
            rightPadding: 25,
            useMaxWidth: true
          },
          pie: {
            useMaxWidth: true
          },
          journey: {
            useMaxWidth: true
          },
          gitGraph: {
            useMaxWidth: true
          }
        });
        setMermaidInitialized(true);
        console.log('Mermaid initialized successfully with theme:', mermaidTheme);
        
        // 主题变更时重新渲染图表
        if (renderedContent && containerRef.current) {
          setTimeout(() => {
            renderMermaidCharts();
          }, 100);
        }
      } catch (err) {
        console.error('Mermaid initialization failed:', err);
        setError('Mermaid初始化失败');
      }
    }
  }, [enableMermaid, mermaidTheme]); // 移除mermaidInitialized依赖，避免循环

  // 配置marked
  const markedInstance = useMemo(() => {
    const renderer = new marked.Renderer();

    // 自定义代码块渲染
    renderer.code = ({
      text,
      lang,
      escaped,
    }: {
      text: string;
      lang?: string;
      escaped?: boolean;
    }) => {
      // 检查是否是Mermaid代码块
      if (enableMermaid && (lang === "mermaid" || lang === "mmd")) {
        const id = `mermaid-${++mermaidCounterRef.current}`;
        // 使用 data 属性存储编码后的代码
        const encodedCode = encodeURIComponent(text);
        return `<div class="mermaid-container" data-mermaid-id="${id}" data-mermaid-code="${encodedCode}" style="display: none;"></div>`;
      }

      // 普通代码块处理
      if (enableHighlight && lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(text, { language: lang }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (err) {
          console.warn("Code highlighting failed:", err);
        }
      }

      return `<pre><code class="${lang ? `language-${lang}` : ""}">${escaped ? text : text}</code></pre>`;
    };

    // 自定义链接渲染（安全处理）
    renderer.link = ({
      href,
      title,
      tokens,
    }: {
      href: string;
      title?: string | null;
      tokens?: any[];
    }) => {
      const titleAttr = title ? ` title="${title}"` : "";
      // 从tokens中提取文本内容
      const text = tokens
        ? tokens.map((token) => token.raw || token.text || "").join("")
        : href;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    // 自定义图片渲染
    renderer.image = ({
      href,
      title,
      text,
    }: {
      href: string;
      title?: string | null;
      text?: string;
    }) => {
      const titleAttr = title ? ` title="${title}"` : "";
      const altAttr = text ? ` alt="${text}"` : "";
      return `<img src="${href}" style="max-width: 100%; height: auto;"${titleAttr}${altAttr} />`;
    };

    const options: MarkedOptions = {
      renderer,
      gfm: true,
      breaks: true,
      pedantic: false,
      ...markedOptions,
    };

    marked.setOptions(options);
    return marked;
  }, [enableHighlight, enableMermaid, markedOptions]);

  // 渲染Mermaid图表
  const renderMermaidCharts = useCallback(async () => {
    if (!containerRef.current || !enableMermaid || renderingRef.current) {
      return;
    }
    
    renderingRef.current = true;
    
    try {
      const mermaidContainers = containerRef.current.querySelectorAll('.mermaid-container');
      console.log(`Found ${mermaidContainers.length} mermaid containers`);
      
      for (const container of Array.from(mermaidContainers)) {
        const id = container.getAttribute('data-mermaid-id');
        const encodedCode = container.getAttribute('data-mermaid-code');
        
        if (!id || !encodedCode) {
          console.warn('Missing id or code for mermaid container');
          continue;
        }
        
        // 解码获取原始代码
        const code = decodeURIComponent(encodedCode).trim();
        
        try {
          console.log(`Rendering mermaid chart ${id} with theme ${mermaidTheme}:`, code);
          
          // 清理之前的内容
          container.innerHTML = "";
          (container as HTMLElement).style.display = "block";
          
          // 生成新的唯一ID以避免缓存问题
          const uniqueId = `${id}-${mermaidTheme}-${Date.now()}`;
          
          // 验证Mermaid代码
          const isValid = await mermaid.parse(code);
          if (!isValid) {
            throw new Error("Invalid mermaid syntax");
          }
          
          // 渲染Mermaid图表
          const { svg } = await mermaid.render(uniqueId, code);
          
          // 创建包装容器
          const chartContainer = document.createElement("div");
          chartContainer.className = "mermaid-chart";
          chartContainer.innerHTML = svg;
          
          container.appendChild(chartContainer);
          console.log(`Successfully rendered mermaid chart ${id} with theme ${mermaidTheme}`);
          
        } catch (err) {
          console.error('Mermaid render error for chart:', id, err);
          (container as HTMLElement).style.display = "block";
          container.innerHTML = `
            <div class="mermaid-error" style="
              padding: 12px;
              background: #fff2f0;
              border: 1px solid #ffccc7;
              border-radius: 4px;
              color: #a8071a;
              font-family: monospace;
              font-size: 12px;
              margin: 16px 0;
            ">
              <strong>Mermaid渲染错误:</strong><br/>
              <code>${err instanceof Error ? err.message : "未知错误"}</code>
              <details style="margin-top: 8px;">
                <summary>原始代码</summary>
                <pre style="margin-top: 4px; background: #f5f5f5; padding: 8px; border-radius: 2px;">${code}</pre>
              </details>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('General mermaid rendering error:', err);
    } finally {
      renderingRef.current = false;
    }
  }, [enableMermaid, mermaidTheme]); // 添加mermaidTheme依赖

  // 处理内容变化
  useEffect(() => {
    const processContent = async () => {
      if (!content.trim()) {
        setRenderedContent("");
        return;
      }

      setIsLoading(true);
      setError(null);
      mermaidCounterRef.current = 0; // 重置计数器

      try {
        // 解析Markdown
        const rawHtml = await markedInstance.parse(content);

        // 清理HTML（防止XSS攻击）- 更宽松的配置以支持Mermaid
        const cleanHtml = DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ["div"],
          ADD_ATTR: ["data-mermaid-id", "data-mermaid-code", "class", "style"],
          ALLOW_DATA_ATTR: true,
          KEEP_CONTENT: true,
        });

        setRenderedContent(cleanHtml);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Markdown解析失败");
        console.error("Markdown parsing error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    processContent();
  }, [content, markedInstance]);

  // 渲染Mermaid图表
  useEffect(() => {
    if (renderedContent && enableMermaid && mermaidInitialized) {
      // 确保DOM完全更新后再渲染
      const timer = setTimeout(() => {
        renderMermaidCharts();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [renderedContent, enableMermaid, mermaidInitialized, renderMermaidCharts]);

  const containerContent = (
    <div
      ref={containerRef}
      className={`markdown-renderer ${className || ""}`}
      style={{
        lineHeight: "1.6",
        color: "var(--color-text-1)",
        ...style,
      }}
    >
      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin tip="渲染中..." />
        </div>
      )}

      {error && <Alert type="error" style={{ marginBottom: "16px" }} />}

      {!isLoading && !error && (
        <>
          <style>{`
            .markdown-renderer h1, 
            .markdown-renderer h2, 
            .markdown-renderer h3, 
            .markdown-renderer h4, 
            .markdown-renderer h5, 
            .markdown-renderer h6 {
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: 600;
              line-height: 1.25;
            }
            .markdown-renderer h1 {
              font-size: 2em;
              border-bottom: 1px solid var(--color-border-2);
              padding-bottom: 8px;
            }
            .markdown-renderer h2 {
              font-size: 1.5em;
              border-bottom: 1px solid var(--color-border-2);
              padding-bottom: 8px;
            }
            .markdown-renderer h3 {
              font-size: 1.25em;
            }
            .markdown-renderer p {
              margin-bottom: 16px;
            }
            .markdown-renderer ul, 
            .markdown-renderer ol {
              margin-bottom: 16px;
              padding-left: 24px;
            }
            .markdown-renderer li {
              margin-bottom: 4px;
            }
            .markdown-renderer blockquote {
              margin: 16px 0;
              padding: 8px 16px;
              border-left: 4px solid var(--color-primary);
              background: var(--color-bg-2);
              color: var(--color-text-2);
            }
            .markdown-renderer pre {
              background: var(--color-bg-2);
              padding: 12px;
              border-radius: 4px;
              overflow: auto;
              margin-bottom: 16px;
            }
            .markdown-renderer code {
              background: var(--color-bg-2);
              padding: 2px 4px;
              border-radius: 3px;
              font-size: 0.9em;
              font-family: Monaco, Menlo, "Ubuntu Mono", monospace;
            }
            .markdown-renderer pre code {
              background: transparent;
              padding: 0;
            }
            .markdown-renderer table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            .markdown-renderer th, 
            .markdown-renderer td {
              border: 1px solid var(--color-border-2);
              padding: 8px 12px;
              text-align: left;
            }
            .markdown-renderer th {
              background: var(--color-bg-2);
              font-weight: 600;
            }
            .markdown-renderer .mermaid-chart {
              text-align: center;
              margin: 16px 0;
              padding: 16px;
              background: #fafafa;
              border-radius: 4px;
              overflow-x: auto;
              border: 1px solid #e8e8e8;
            }
            .markdown-renderer .mermaid-chart svg {
              max-width: 100%;
              height: auto;
            }
            .markdown-renderer .mermaid-container {
              margin: 16px 0;
            }
            .markdown-renderer .mermaid-error {
              font-family: monospace;
            }
          `}</style>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
          <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
        </>
      )}
    </div>
  );

  if (bordered) {
    return <Card bodyStyle={{ padding: "20px" }}>{containerContent}</Card>;
  }

  return containerContent;
};

export default MarkdownRenderer;
