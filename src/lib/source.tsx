import { mdxComponents } from "@/mdx-components";
import {
  COLLECTIONS,
  COLLECTION_ORDER,
  getAllPages,
  getPage,
  getPages,
  pageHref,
  siblingsOf,
  type CollectionKey,
  type PageMeta,
} from "@/lib/content";

/** The single content source consumed by routes, search, sitemap and RSS. */
export const source = {
  collections: COLLECTIONS,
  order: COLLECTION_ORDER,
  href: pageHref,
  pages: getPages,
  allPages: getAllPages,
  page: getPage,
  siblings: siblingsOf,
  components: mdxComponents,
};

export type { CollectionKey, PageMeta };
