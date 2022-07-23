import Link from "next/link";
import { getPosts } from "../libs/posts";

export async function getStaticProps() {
  const posts = getPosts({ page: 1, limit: 10 });
  return {
    props: {
      posts,
    },
  };
}

export default function Posts({ posts }) {
  return (
    <div className="posts">
      {posts.length > 0 &&
        posts.map(({ slug, title, description, author, date }) => {
          return (
            <Link key={slug} href={`/posts/${slug}`}>
              <div className="card">
                <h1>{title}</h1>
                <p className="desc">{description}</p>
                <p className="meta">
                  <span>{`By ${author}`}</span>
                  <span>{date}</span>
                </p>
              </div>
            </Link>
          );
        })}
    </div>
  );
}