import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism as LightStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";

function components() {
  const hx = (children) => {
    const id = children
      .join("")
      .toLowerCase()
      .replace(/\s+|[^a-z0-9]/gi, "_");
    return (
      <>
        <a id={id} className="heading-anchor"></a>
        <h3>{children}</h3>
      </>
    );
  };
  return {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <>
          <SyntaxHighlighter
            style={LightStyle}
            language={match[1]}
            PreTag="div"
            // eslint-disable-next-line react/no-children-prop
            children={String(children).replace(/\n$/, "")}
            showLineNumbers={true}
            customStyle={{
              backgroundColor: "rgba(245, 245, 245, 1)",
              opacity: "1",
            }}
            codeTagProps={{
              style: {
                backgroundColor: "transparent",
              },
            }}
            {...props}
          />
        </>
      ) : (
        <code className="" style={{ borderRadius: "4px" }} {...props}>
          {children}
        </code>
      );
    },
    h1({ node, inline, className, children, ...props }) {
      return hx(children);
    },
    h2({ node, inline, className, children, ...props }) {
      return hx(children);
    },
    h3({ node, inline, className, children, ...props }) {
      return hx(children);
    },
  };
}

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components()}
    >
      {children}
    </ReactMarkdown>
  );
}
