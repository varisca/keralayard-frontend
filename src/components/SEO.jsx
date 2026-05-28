import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Kerala Yard";
const DEFAULT_TITLE = "Kerala Yard - Authentic Kerala Groceries Delivered Fresh";
const DEFAULT_DESCRIPTION =
  "Shop authentic Kerala groceries online, including banana chips, coconut oil, spices, pickles, appam mix, puttu podi, and homemade snacks.";
const DEFAULT_IMAGE = "/hero_banner.png";

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
      return;
    }
    element.setAttribute(key, value);
  });
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const removeJsonLd = () => {
  document
    .querySelectorAll('script[data-seo-json-ld="true"]')
    .forEach((element) => element.remove());
};

const appendJsonLd = (schema) => {
  if (!schema) return;

  const schemas = Array.isArray(schema) ? schema : [schema];
  schemas.filter(Boolean).forEach((item) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonLd = "true";
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
};

const getAbsoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
};

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = "Kerala groceries, Kerala products online, banana chips, coconut oil, Kerala spices, pickles, puttu podi, appam mix",
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
}) => {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = getAbsoluteUrl(location.pathname);
    const imageUrl = getAbsoluteUrl(image);

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="keywords"]', {
      name: "keywords",
      content: keywords,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow",
    });

    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: pageTitle,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: imageUrl,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: pageTitle,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: imageUrl,
    });

    upsertLink("canonical", canonicalUrl);
    removeJsonLd();
    appendJsonLd(jsonLd);

    return removeJsonLd;
  }, [description, image, jsonLd, keywords, location.pathname, noIndex, title, type]);

  return null;
};

export default SEO;
