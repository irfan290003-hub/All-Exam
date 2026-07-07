import React, { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface SEOProps {
  title: string;
  description: string;
  path: string;
  breadcrumbs?: BreadcrumbItem[];
  customJsonLd?: Record<string, any>;
}

export default function SEO({ title, description, path, breadcrumbs, customJsonLd }: SEOProps) {
  useEffect(() => {
    // 1. Title
    const formattedTitle = `${title} | ALL EXAM - Sarkari Result, Govt Jobs, Admit Card & Results`;
    document.title = formattedTitle;

    // Helper to find or create a meta tag
    const setMetaTag = (attrName: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", contentValue);
    };

    // Helper to find or create a link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Helper to add JSON-LD script tags
    const addJsonLd = (id: string, data: Record<string, any>) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    };

    // 2. Meta Description
    setMetaTag("name", "description", description);

    // 3. Canonical URL
    const canonicalUrl = `https://www.allexam.org${path}`;
    setLinkTag("canonical", canonicalUrl);

    // 4. Open Graph
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:image", "https://allexam.org/og-image.png");

    // 5. Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", "https://allexam.org/og-image.png");

    // 6. Breadcrumb Schema (JSON-LD)
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `https://allexam.org${item.path}`
        }))
      };
      addJsonLd("breadcrumb-jsonld", breadcrumbList);
    }

    // 7. Custom JSON-LD (e.g. Organization or Article)
    if (customJsonLd) {
      addJsonLd("custom-seo-jsonld", customJsonLd);
    }

    // Cleanup function to remove tags when component unmounts
    return () => {
      const breadcrumbScript = document.getElementById("breadcrumb-jsonld");
      if (breadcrumbScript) breadcrumbScript.remove();
      
      const customScript = document.getElementById("custom-seo-jsonld");
      if (customScript) customScript.remove();
    };
  }, [title, description, path, breadcrumbs, customJsonLd]);

  return null;
}
