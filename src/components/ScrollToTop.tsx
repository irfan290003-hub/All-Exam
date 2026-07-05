import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getCategoryId = (cat: string) => {
  const norm = cat.toLowerCase().trim();
  if (norm === "exam" || norm === "latest jobs" || norm === "jobs") return "section-exam";
  if (norm === "admit card" || norm === "admit cards") return "section-admit-card";
  if (norm === "result" || norm === "results" || norm === "latest results") return "section-result";
  if (norm === "answer key" || norm === "answer keys") return "section-answer-key";
  if (norm === "syllabus" || norm === "syllabus guides") return "section-syllabus";
  if (norm === "sarkari yojana" || norm === "yojana" || norm === "yojanas") return "section-sarkari-yojana";
  if (norm === "news" || norm === "educational news") return "section-news";
  if (norm === "notice" || norm === "notices" || norm === "notice alerts") return "section-notice";
  return "";
};

const scrollToElementWithOffset = (element: HTMLElement) => {
  const navbar = document.querySelector("header");
  const navbarHeight = navbar ? navbar.offsetHeight : 80;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - navbarHeight - 20; // 20px extra offset for breathing space

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const category = params.get("category");
    const hasSearch = params.has("search");

    if (pathname === "/" && (category || hasSearch)) {
      let targetId = "category-results-section";
      if (category) {
        const catId = getCategoryId(category);
        if (catId) {
          targetId = catId;
        }
      }

      let attempts = 0;
      const tryScroll = () => {
        const element = document.getElementById(targetId) || document.getElementById("category-results-section");
        if (element) {
          scrollToElementWithOffset(element);
        } else if (attempts < 15) {
          attempts++;
          setTimeout(tryScroll, 50); // check every 50ms up to 750ms
        }
      };

      tryScroll();
    } else {
      // Normal page navigation, scroll smoothly to the absolute top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [pathname, search]);

  return null;
}

