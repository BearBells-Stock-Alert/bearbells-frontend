import { useEffect } from "react";

interface HtmlReportProps {
    html: string;
  }
  
  export function HtmlReport({ html }: HtmlReportProps) {
    useEffect(() => {
      const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
      if (styleMatch) {
        const styleTag = document.createElement("style");
        styleTag.innerHTML = styleMatch[1];
        document.head.appendChild(styleTag);
  
        return () => {
          document.head.removeChild(styleTag);
        };
      }
    }, [html]);
  
    const cleanHtml = html
      .replace(/<!DOCTYPE html>/gi, "")
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head>[\s\S]*?<\/head>/gi, "")
      .replace(/<body[^>]*>/gi, "")
      .replace(/<\/body>/gi, "");
  
    return (
      <div
        className="rendered-report"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }
  