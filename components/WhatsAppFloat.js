"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const GROUP_URL = "https://chat.whatsapp.com/B8elcmVfb2J0F9gQktYUaF";
const STORAGE_KEY = "buywater_wa_float_pos";

// Processed user WhatsApp icon (white bg removed, soft circular blend)
const WA_ICON =
  "data:image/png;base64," +
  "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDRmHbAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF+mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZUhGc0V4cGJhZ1JnQiI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xMjg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTI4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InIiPz5hS6weAAAHVklEQVR4nO2dW4hVVRjHf2cmZ0YzzUzN8pJZ2UWpLCsp6EJBGURF0ENFD0FQ0EvQQ1AP0UPQQ9BDEARBEFEQRBFEEEQRRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRRBEEEQQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRRBEEEQQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRBBEEEUQRRBEEEQQRBBEEEUQRBBEEEUQRBBEEEUQ/wMAAP//AwANLwGAfQAAAAAASUVORK5CYII=";

export default function WhatsAppFloat() {
  const path = usePathname();
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, ox: 0, oy: 0, moved: false });

  const hide =
    path?.startsWith("/admin") || path?.startsWith("/admin-login");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.x === "number" && typeof p.y === "number") {
          setPos(p);
          return;
        }
      }
    } catch (_) {}
    setPos({
      x: typeof window !== "undefined" ? window.innerWidth - 80 : 20,
      y: typeof window !== "undefined" ? window.innerHeight - 80 : 20,
    });
  }, []);

  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current.active) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const size = 56;
      const x = Math.min(Math.max(8, clientX - dragRef.current.ox), window.innerWidth - size - 8);
      const y = Math.min(Math.max(8, clientY - dragRef.current.oy), window.innerHeight - size - 8);
      dragRef.current.moved = true;
      setPos({ x, y });
    }
    function onUp() {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setDragging(false);
      setPos((p) => {
        if (p.x != null) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          } catch (_) {}
        }
        return p;
      });
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  if (hide || pos.x == null) return null;

  function startDrag(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      active: true,
      ox: clientX - pos.x,
      oy: clientY - pos.y,
      moved: false,
    };
    setDragging(true);
  }

  function onClick(e) {
    if (dragRef.current.moved) e.preventDefault();
  }

  return (
    <a
      href={GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join BuyWater WhatsApp group"
      title="Drag to move · Click to open WhatsApp"
      onClick={onClick}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 50,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        animationPlayState: dragging ? "paused" : "running",
      }}
      className="wa-float-btn block h-14 w-14 focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
    >
      <span className="wa-float-ring" aria-hidden="true" />
      <span className="wa-float-disc" aria-hidden="true" />
      <img
        src={WA_ICON}
        alt="WhatsApp"
        draggable={false}
        width={56}
        height={56}
        className="pointer-events-none relative z-[1] h-14 w-14 select-none object-contain drop-shadow-[0_4px_12px_rgba(37,211,102,0.35)]"
      />
    </a>
  );
}
