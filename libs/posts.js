import fs from "node:fs";
import path from "node:path";
import * as matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import jsdom from "jsdom";

export function getPosts({ page, limit }) {
  page = page ?? 1;
  limit = limit ?? 10;
  const dirPath = path.resolve("posts");
  const fileNames = fs.readdirSync(dirPath);
  let posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const filePath = path.join(dirPath, fileName);
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });
    const matterObject = matter(content);
    return {
      slug,
      ...matterObject.data,
    };
  });
  posts
    .sort(({ date: a }, { date: b }) => {
      if (a > b) return 1;
      else if (a < b) return -1;
      else return 0;
    })
    .reverse();
  return posts.slice((page - 1) * limit, page * limit);
}

export async function getPost(slug) {
  const dirPath = path.resolve("posts");
  const filePath = path.join(dirPath, `${slug}.md`);
  const content = fs.readFileSync(filePath, { encoding: "utf-8" });
  const matterObject = matter(content);

  const processedContent = await remark()
    .use(remarkHtml)
    .process(matterObject.content);
  const contentHtml = processedContent.toString();
  const { headingAnchors, contentHtmlWithAnchors } =
    getHeadingAnchors(contentHtml);

  return {
    slug,
    headingAnchors,
    contentMarkdown: matterObject.content,
    ...matterObject.data,
  };
}

export function getPostsSlugs() {
  const dirPath = path.resolve("posts");
  const fileNames = fs.readdirSync(dirPath);
  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md/, "");
    return {
      params: {
        slug,
      },
    };
  });
}

function getHeadingAnchors(str) {
  const headingAnchors = [];
  const dom = new jsdom.JSDOM(`<div id="headinganchors">${str}</div>`);
  dom.window.document.querySelectorAll("h1, h2, h3").forEach((hx) => {
    const id = hx.textContent.toLowerCase().replace(/\s+|[^a-z0-9]/g, "_");
    const anchor = dom.window.document.createElement("a");
    anchor.id = id;
    hx.insertBefore(anchor, null);

    headingAnchors.push({
      heading: hx.nodeName.toLowerCase(),
      title: hx.textContent,
      anchorId: id,
    });
  });
  const contentHtmlWithAnchors =
    dom.window.document.getElementById("headinganchors").innerHTML;
  return {
    headingAnchors,
    contentHtmlWithAnchors,
  };
}
