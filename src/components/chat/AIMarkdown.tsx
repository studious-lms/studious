"use client";

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';

// Initialize mermaid with theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidProps {
  chart: string;
}

function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError('Failed to render diagram');
        console.error('Mermaid error:', err);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-3 p-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
        <p>{error}</p>
        <pre className="mt-2 text-xs overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="my-3 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface AIMarkdownProps {
  content: string;
  className?: string;
}

export function AIMarkdown({ content, className }: AIMarkdownProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold mb-2 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-1 text-foreground">{children}</h3>
          ),
          
          // Customize paragraph styles
          p: ({ children }) => (
            <p className="mb-2 text-foreground leading-relaxed">{children}</p>
          ),
          
          // Customize list styles
          ul: ({ children }) => (
            <ul className="mb-2 ml-4 space-y-1 list-disc text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 ml-4 space-y-1 list-decimal text-foreground">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">{children}</li>
          ),
          
          // Customize code styles - handle mermaid blocks
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match?.[1];
            const codeContent = String(children).replace(/\n$/, '');
            
            // Render mermaid diagrams
            if (language === 'mermaid') {
              return <Mermaid chart={codeContent} />;
            }
            
            if (!inline && match) {
              // Block code with syntax highlighting
              return (
                <div className="my-3 rounded-md border border-border overflow-hidden">
                  <div className="bg-muted px-3 py-1 text-xs text-muted-foreground font-mono border-b border-border">
                    {language}
                  </div>
                  <pre className="p-3 overflow-x-auto bg-background">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            
            // Inline code
            return (
              <code 
                className="px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground font-mono text-xs"
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Customize blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          
          // Customize table styles
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border border-border rounded-md">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-foreground border-b border-border">
              {children}
            </td>
          ),
          
          // Customize link styles
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          
          // Customize horizontal rule
          hr: () => (
            <hr className="my-4 border-border" />
          ),
          
          // Customize strong/bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          
          // Customize emphasis/italic text
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
