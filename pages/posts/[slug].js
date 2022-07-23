import { useState, useEffect } from "react";
import { getPost, getPostsSlugs } from "../../libs/posts";
import Markdown from "../../components/markdown";

export async function getStaticPaths() {
  const paths = getPostsSlugs();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const post = await getPost(slug);
  return {
    props: {
      slug,
      post,
    },
  };
}

export default function Post({ slug, post }) {
  const [scrollTop, setScrollTop] = useState(0);
  useEffect(() => {
    const updateTocAnchors = (e) => {
      const headingAnchors = e.target.documentElement.querySelectorAll(
        ".post .content .heading-anchor"
      );
      if (headingAnchors.length === 0) return;
      const activeHeadingAnchors = Array.from(headingAnchors).filter(
        (anchor) => {
          const rect = anchor.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= e.target.documentElement.clientHeight &&
            rect.right <= e.target.documentElement.clientWidth
          );
        }
      );
      if (activeHeadingAnchors.length === 0) return;
      // Deactivate all ToC anchors
      const tocAnchors = e.target.documentElement.querySelectorAll(
        ".post .sidebar .toc .toc-anchor"
      );
      if (tocAnchors.length === 0) return;
      Array.from(tocAnchors).forEach((anchor) => {
        anchor.classList.remove("active");
      });
      // Active current ToC anchor
      const tocAnchorId = `toc-${activeHeadingAnchors[0].id}`;
      const activeTocAnchor = e.target.documentElement.querySelector(
        `#${tocAnchorId}`
      );
      if (!activeTocAnchor) return;
      activeTocAnchor.classList.add("active");
    };
    const onScroll = (e) => {
      const currScrollTop = e.target.documentElement.scrollTop;
      setScrollTop(currScrollTop);
      updateTocAnchors(e);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop]);

  return (
    <div className="post">
      <h1>{post.title}</h1>
      <p className="desc">{post.description}</p>
      <div className="meta">
        <span>{`By ${post.author}`}</span>
        <span>{post.date}</span>
      </div>
      <div className="wrapper">
        <aside className="sidebar">
          <div className="toc">
            <h1>Table of Contents</h1>
            {post.headingAnchors.length > 0 && (
              <ul>
                {post.headingAnchors.map((anchor) => {
                  return (
                    <li
                      id={`toc-${anchor.anchorId}`}
                      key={anchor.anchorId}
                      className={`ml${anchor.heading[1]} toc-anchor`}
                    >
                      <a href={`#${anchor.anchorId}`}>{anchor.title}</a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
        <article className="content">
          <Markdown>{post.contentMarkdown}</Markdown>
        </article>
      </div>
    </div>
  );
}
