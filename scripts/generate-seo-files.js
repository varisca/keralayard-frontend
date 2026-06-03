import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectId = "kerala-yard";
const baseUrl = "https://keralayard.com";

async function fetchCollection(collectionName) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?pageSize=200`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch ${collectionName}: ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data.documents || [];
  } catch (err) {
    console.error(`Error fetching ${collectionName}:`, err);
    return [];
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function getFieldValue(doc, fieldName) {
  if (!doc || !doc.fields || !doc.fields[fieldName]) return null;
  const valueObj = doc.fields[fieldName];
  if ("stringValue" in valueObj) return valueObj.stringValue;
  if ("integerValue" in valueObj) return parseInt(valueObj.integerValue, 10);
  if ("doubleValue" in valueObj) return parseFloat(valueObj.doubleValue);
  if ("booleanValue" in valueObj) return valueObj.booleanValue;
  if ("timestampValue" in valueObj) return valueObj.timestampValue;
  return null;
}

async function main() {
  console.log("Starting SEO files generation...");

  // Fetch Categories
  const rawCategories = await fetchCollection("categories");
  const activeCategories = rawCategories
    .map(doc => {
      const id = doc.name.split("/").pop();
      return {
        id,
        name: getFieldValue(doc, "name"),
        slug: getFieldValue(doc, "slug"),
        active: getFieldValue(doc, "active") !== false,
        updateTime: doc.updateTime
      };
    })
    .filter(c => c.active && c.slug);

  console.log(`Resolved ${activeCategories.length} active categories.`);

  // Fetch Products
  const rawProducts = await fetchCollection("products");
  const activeProducts = rawProducts
    .map(doc => {
      const id = doc.name.split("/").pop();
      return {
        id,
        name: getFieldValue(doc, "name"),
        slug: getFieldValue(doc, "slug"),
        categoryId: getFieldValue(doc, "categoryId"),
        categoryName: getFieldValue(doc, "categoryName"),
        active: getFieldValue(doc, "active") !== false,
        updateTime: doc.updateTime
      };
    })
    .filter(p => p.active && p.slug);

  console.log(`Resolved ${activeProducts.length} active products.`);

  // Format lastmod dates
  const today = new Date().toISOString().split("T")[0];

  // Static URLs
  const urls = [
    { loc: `${baseUrl}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/about`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${baseUrl}/products`, lastmod: today, changefreq: "daily", priority: "0.9" }
  ];

  // Category URLs
  activeCategories.forEach(cat => {
    const lastmod = cat.updateTime ? cat.updateTime.split("T")[0] : today;
    urls.push({
      loc: `${baseUrl}/products/${encodeURIComponent(cat.slug)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8"
    });
  });

  // Product URLs
  activeProducts.forEach(prod => {
    const categoryObj = activeCategories.find(c => c.id === prod.categoryId || c.name === prod.categoryName);
    const categorySlug = categoryObj ? categoryObj.slug : "general";
    const lastmod = prod.updateTime ? prod.updateTime.split("T")[0] : today;
    urls.push({
      loc: `${baseUrl}/products/${encodeURIComponent(categorySlug)}/${encodeURIComponent(prod.id)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.7"
    });
  });

  // De-duplicate URLs
  const uniqueUrls = [];
  const seenUrls = new Set();
  urls.forEach(u => {
    if (!seenUrls.has(u.loc)) {
      seenUrls.add(u.loc);
      uniqueUrls.push(u);
    }
  });

  // Generate XML sitemap
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  uniqueUrls.forEach(u => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n`;
    xml += `    <changefreq>${escapeXml(u.changefreq)}</changefreq>\n`;
    xml += `    <priority>${escapeXml(u.priority)}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  // Generate robots.txt
  let robots = `User-agent: *\n`;
  robots += `Allow: /\n\n`;
  robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  // Write files
  const publicDir = path.resolve(__dirname, "../public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  const robotsPath = path.join(publicDir, "robots.txt");

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Generated: ${sitemapPath}`);

  fs.writeFileSync(robotsPath, robots, "utf8");
  console.log(`Generated: ${robotsPath}`);
  
  console.log("SEO files successfully created!");
}

main().catch(err => {
  console.error("SEO generation failed:", err);
  process.exit(1);
});
