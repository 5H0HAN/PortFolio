"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/tools", label: "Tools" },
];

type TogglePosition = {
  x: number;
  y: number;
};

type DragState = TogglePosition & {
  pointerId: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
};

type DragListeners = {
  move: (event: PointerEvent) => void;
  finish: (event: PointerEvent) => void;
};

const TOGGLE_EDGE_GAP = 12;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

export default function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [togglePosition, setTogglePosition] =
    useState<TogglePosition | null>(null);
  const [isDraggingToggle, setIsDraggingToggle] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dragState = useRef<DragState | null>(null);
  const dragListeners = useRef<DragListeners | null>(null);
  const toggleSide = useRef<"left" | "right">("right");
  const suppressThemeToggle = useRef(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }


    const closeMenu = (restoreFocus = false) => {
      setMenuOpen(false);
      if (restoreFocus) {
        window.requestAnimationFrame(() => menuToggleRef.current?.focus());
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1080) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    let animationFrame = 0;

    const updateScrollProgress = () => {
      animationFrame = 0;
      const maximumScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        maximumScroll <= 1
          ? 1
          : clamp(window.scrollY / maximumScroll, 0, 1);

      navRef.current?.style.setProperty(
        "--nav-scroll-progress",
        String(nextProgress),
      );
    };

    const requestProgressUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    const resizeObserver = new ResizeObserver(requestProgressUpdate);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
    requestProgressUpdate();

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const applyTheme = () => {
      let savedTheme: string | null = null;
      try {
        savedTheme = window.localStorage.getItem("portfolio-theme");
      } catch {
        // Storage can be disabled; the system preference remains a safe fallback.
      }
      const systemTheme = media.matches ? "light" : "dark";
      const resolvedTheme =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : systemTheme;

      document.documentElement.setAttribute("data-theme", resolvedTheme);
      setTheme(resolvedTheme);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, []);

  useEffect(() => {
    const keepToggleInViewport = () => {
      setTogglePosition((current) => {
        if (!current) {
          return current;
        }

        const rect = toggleRef.current?.getBoundingClientRect();
        const width = rect?.width ?? 52;
        const height = rect?.height ?? 52;
        const next = {
          x:
            toggleSide.current === "left"
              ? TOGGLE_EDGE_GAP
              : window.innerWidth - width - TOGGLE_EDGE_GAP,
          y: clamp(
            current.y,
            TOGGLE_EDGE_GAP,
            window.innerHeight - height - TOGGLE_EDGE_GAP,
          ),
        };

        return next.x === current.x && next.y === current.y ? current : next;
      });
    };

    window.addEventListener("resize", keepToggleInViewport);
    return () => window.removeEventListener("resize", keepToggleInViewport);
  }, []);

  useEffect(
    () => () => {
      const listeners = dragListeners.current;
      if (!listeners) {
        return;
      }

      window.removeEventListener("pointermove", listeners.move);
      window.removeEventListener("pointerup", listeners.finish);
      window.removeEventListener("pointercancel", listeners.finish);
    },
    [],
  );

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("portfolio-theme", next);
      } catch {
        // The visual toggle still works when persistent storage is unavailable.
      }
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const startToggleDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
    suppressThemeToggle.current = false;
    setIsDraggingToggle(true);

    const move = (moveEvent: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== moveEvent.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - drag.startX;
      const deltaY = moveEvent.clientY - drag.startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        suppressThemeToggle.current = true;
      }

      if (!suppressThemeToggle.current) {
        return;
      }

      moveEvent.preventDefault();
      setTogglePosition({
        x: clamp(
          drag.x + deltaX,
          TOGGLE_EDGE_GAP,
          window.innerWidth - drag.width - TOGGLE_EDGE_GAP,
        ),
        y: clamp(
          drag.y + deltaY,
          TOGGLE_EDGE_GAP,
          window.innerHeight - drag.height - TOGGLE_EDGE_GAP,
        ),
      });
    };

    const finish = (finishEvent: PointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== finishEvent.pointerId) {
        return;
      }

      if (
        finishEvent.type === "pointerup" &&
        suppressThemeToggle.current
      ) {
        const nextSide =
          finishEvent.clientX < window.innerWidth / 2 ? "left" : "right";
        toggleSide.current = nextSide;
        setTogglePosition({
          x:
            nextSide === "left"
              ? TOGGLE_EDGE_GAP
              : window.innerWidth - drag.width - TOGGLE_EDGE_GAP,
          y: clamp(
            drag.y + finishEvent.clientY - drag.startY,
            TOGGLE_EDGE_GAP,
            window.innerHeight - drag.height - TOGGLE_EDGE_GAP,
          ),
        });
      }

      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      dragListeners.current = null;
      dragState.current = null;
      setIsDraggingToggle(false);

      if (finishEvent.type === "pointercancel") {
        suppressThemeToggle.current = false;
      }
    };

    dragListeners.current = { move, finish };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  const handleThemeClick = () => {
    if (suppressThemeToggle.current) {
      suppressThemeToggle.current = false;
      return;
    }

    toggleTheme();
  };

  const toggleStyle = togglePosition
    ? ({
        "--theme-toggle-x": `${togglePosition.x}px`,
        "--theme-toggle-y": `${togglePosition.y}px`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <nav
        ref={navRef}
        className="site-nav"
        aria-label="Primary navigation"
      >
        <span className="nav-scroll-progress" aria-hidden="true">
          <span className="nav-scroll-progress-fill" />
        </span>

        <Link href="/" className="brand" aria-label="Shohan Biswas, home">
          <span className="brand-mark" aria-hidden="true">
            SB
          </span>
          <span className="brand-name">Shohan Biswas</span>
        </Link>

        <button
          ref={menuToggleRef}
          type="button"
          className="nav-menu-toggle"
          aria-label={`${menuOpen ? "Close" : "Open"} navigation menu`}
          aria-expanded={menuOpen}
          aria-controls="site-nav-links"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="nav-menu-toggle-label">
            {menuOpen ? "Close" : "Menu"}
          </span>
          <span className="nav-menu-toggle-icon" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>

        <ul
          id="site-nav-links"
          className={`nav-links ${menuOpen ? "is-open" : ""}`}
        >
          <li className="nav-panel-heading" aria-hidden="true">
            <span>Navigation</span>
            <span>{navLinks.length} routes</span>
          </li>
          {navLinks.map((link, index) => {
            const active = Boolean(isActive(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="nav-link-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="nav-link-label">{link.label}</span>
                  <span className="nav-link-arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className={`nav-menu-scrim ${menuOpen ? "is-open" : ""}`}
        aria-label="Close navigation menu"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <button
        ref={toggleRef}
        type="button"
        className={`theme-toggle ${togglePosition ? "is-positioned" : ""} ${
          isDraggingToggle ? "is-dragging" : ""
        }`}
        style={toggleStyle}
        draggable={false}
        onClick={handleThemeClick}
        onPointerDown={startToggleDrag}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "light"}
        title="Switch color mode. Drag to reposition."
      >
        <span className="theme-toggle-visual" aria-hidden="true">
          <svg
            className="theme-icon theme-icon-sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg
            className="theme-icon theme-icon-moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1 -9 -9Z" />
          </svg>
        </span>
        <span className="sr-only">Toggle theme</span>
      </button>
    </>
  );
}
