"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  Gamepad2,
  Globe,
  Star,
  Clock3,
  Settings,
  Swords,
  Flag,
  Car,
  Volleyball,
  HandFist,
  Feather,
  ChessKnight,
  Puzzle,
  Crosshair,
  Box,
  Ellipsis,
  Search,
  Battery,
  ArrowLeft,
  Maximize,
  RotateCcw,
  X,
  ChevronRight,
} from "lucide-react";
import { games, featuredIds, type Game } from "../data/games";
const categories = [
  ["Todos los juegos", Gamepad2],
  ["Acción", Swords],
  ["Aventura", Flag],
  ["Carreras", Car],
  ["Deportes", Volleyball],
  ["Lucha", HandFist],
  ["RPG", Feather],
  ["Estrategia", ChessKnight],
  ["Puzzles", Puzzle],
  ["Shoot 'em up", Crosshair],
  ["Plataformas", Box],
  ["Otros", Ellipsis],
] as const;
const tabs = [
  ["Juegos", Gamepad2],
  ["Explorar", Globe],
  ["Favoritos", Star],
  ["Recientes", Clock3],
  ["Ajustes", Settings],
] as const;
type Tab = (typeof tabs)[number][0];
type Preferences = { intensity: number; waves: boolean };
const defaults: Preferences = { intensity: 1, waves: true };
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("gamextore-storage", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("gamextore-storage", cb);
  };
}
function useSaved<T>(key: string, fallback: T): [T, (v: T) => void] {
  const snapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribeStorage, snapshot, () => null);
  const value = useMemo(() => {
    try {
      const parsed = raw ? JSON.parse(raw) : fallback;
      if (Array.isArray(fallback))
        return Array.isArray(parsed)
          ? parsed.filter(
              (id: unknown) =>
                typeof id === "string" && games.some((g) => g.id === id),
            )
          : fallback;
      if (
        typeof parsed?.intensity === "number" &&
        typeof parsed?.waves === "boolean"
      )
        return {
          ...parsed,
          intensity: Math.max(0, Math.min(1, parsed.intensity)),
        };
      return fallback;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
  const save = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
        window.dispatchEvent(new Event("gamextore-storage"));
      } catch {
        window.dispatchEvent(new Event("gamextore-storage-error"));
      }
    },
    [key],
  );
  return [value, save];
}
const empty: string[] = [];
function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
function clockSnapshot() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}  ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}
function Clock() {
  const time = useSyncExternalStore(subscribeClock, clockSnapshot, () => "");
  return (
    <div className="system-clock">
      <time>{time || "—/—  —:—"}</time>
      <Battery
        aria-label="Batería: nivel no disponible"
        size={43}
        strokeWidth={1.2}
      >
        <title>Nivel de batería no disponible</title>
      </Battery>
    </div>
  );
}
function Waves({ moving }: { moving: boolean }) {
  return (
    <div
      className={`xmb-background ${moving ? "moving" : ""}`}
      aria-hidden="true"
    >
      <div className="xmb-light" />
      <svg
        className="wave wave-top"
        viewBox="0 0 1648 928"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2=".4">
            <stop stopColor="#0965bb" stopOpacity=".05" />
            <stop offset=".55" stopColor="#38a9ff" stopOpacity=".2" />
            <stop offset="1" stopColor="#3faeff" stopOpacity=".55" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <path
          className="ribbon"
          d="M-100 110 C 240 210 340 310 720 268 S 1260 108 1760 58 L1760 86 C1220 200 1100 310 720 292 S200 230 -100 152 Z"
          fill="url(#ribbon)"
        />
        <path
          d="M-100 110 C 240 210 340 310 720 268 S 1260 108 1760 58"
          fill="none"
          stroke="#279cff"
          strokeOpacity=".32"
          strokeWidth="3"
        />
        <path
          d="M-100 220 C400 375 520 150 1050 274 S1450 110 1800 180"
          fill="none"
          stroke="#208bec"
          strokeOpacity=".3"
          strokeWidth="2"
        />
        <path
          d="M-100 110 C 240 210 340 310 720 268 S 1260 108 1760 58"
          fill="none"
          stroke="#219dff"
          strokeOpacity=".35"
          strokeWidth="14"
          filter="url(#glow)"
        />
      </svg>
      <svg
        className="wave wave-bottom"
        viewBox="0 0 1648 928"
        preserveAspectRatio="none"
      >
        <path
          d="M-150 970 C350 700 620 645 1070 750 S1520 690 1800 725 L1800 755 C1450 800 1200 810 1000 778 S350 780 -150 1000Z"
          fill="url(#ribbon)"
        />
        <path
          d="M-150 970 C350 700 620 645 1070 750 S1520 690 1800 725"
          fill="none"
          stroke="#2ab3ff"
          strokeWidth="4"
          strokeOpacity=".7"
        />
        <path
          d="M-150 970 C350 700 620 645 1070 750 S1520 690 1800 725"
          fill="none"
          stroke="#008cff"
          strokeWidth="23"
          strokeOpacity=".65"
          filter="url(#glow)"
        />
        <path
          d="M-100 660 C250 770 700 800 1000 748 S1400 820 1780 650"
          fill="none"
          stroke="#1689e0"
          strokeWidth="2"
          strokeOpacity=".2"
        />
      </svg>
    </div>
  );
}
function Cover({ game, priority = false }: { game: Game; priority?: boolean }) {
  return game.cover ? (
    <Image
      src={game.cover}
      alt={`Carátula de ${game.title} para PSP`}
      width={280}
      height={480}
      sizes="(max-width:700px) 160px, 220px"
      priority={priority}
    />
  ) : (
    <div className="cover-missing">
      <span>PSP</span>
      <strong>{game.title}</strong>
      <small>Carátula pendiente</small>
    </div>
  );
}
function Rail({
  children,
  label,
  className = "",
  onKeyDown,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, left: 0, down: false, moved: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    const up = () => {
      drag.current.down = false;
    };
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`rail ${className}`}
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") return;
        drag.current = {
          x: e.clientX,
          left: e.currentTarget.scrollLeft,
          down: true,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.down) return;
        if (Math.abs(e.clientX - d.x) > 5) d.moved = true;
        if (d.moved) e.currentTarget.scrollLeft = d.left - (e.clientX - d.x);
      }}
      onPointerCancel={() => {
        drag.current.down = false;
      }}
      onClickCapture={(e) => {
        if (drag.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          drag.current.moved = false;
        }
      }}
    >
      {children}
    </div>
  );
}
function Detail({
  game,
  onClose,
  favorite,
  onFavorite,
}: {
  game: Game;
  onClose: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <motion.dialog
      ref={ref}
      className="detail"
      onCancel={onClose}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="detail-inner">
        <button className="back" onClick={onClose}>
          <ArrowLeft size={20} /> Volver <kbd>Esc</kbd>
        </button>
        <div className="detail-layout">
          <motion.div className="detail-cover" layoutId={`cover-${game.id}`}>
            <Cover game={game} />
          </motion.div>
          <div className="detail-copy">
            <p className="platform-chip">PSP</p>
            <h1>{game.title}</h1>
            <p className="detail-genre">{game.genres.join(" / ")}</p>
            <p>{game.description}</p>
            <dl>
              <div>
                <dt>Año de estreno original</dt>
                <dd>{game.year}</dd>
              </div>
              <div>
                <dt>Desarrollador</dt>
                <dd>{game.developer}</dd>
              </div>
              <div>
                <dt>Plataforma</dt>
                <dd>PlayStation Portable</dd>
              </div>
            </dl>
            <button
              className="glass-action"
              aria-pressed={favorite}
              onClick={onFavorite}
            >
              <Star size={19} fill={favorite ? "currentColor" : "none"} />
              {favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            </button>
            <a
              className="source-link"
              href={game.source}
              target="_blank"
              rel="noreferrer"
            >
              Consultar información del juego ↗
            </a>
          </div>
        </div>
      </div>
    </motion.dialog>
  );
}
export default function PspExperience() {
  const [tab, setTab] = useState<Tab>("Juegos"),
    [category, setCategory] = useState("Todos los juegos"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(games[0].id),
    [detail, setDetail] = useState<Game | null>(null),
    [sort, setSort] = useState("original"),
    [year, setYear] = useState("Todos"),
    [message, setMessage] = useState("");
  const [favorites, saveFavorites] = useSaved<string[]>(
      "gamextore.psp.favorites",
      empty,
    ),
    [recent, saveRecent] = useSaved<string[]>("gamextore.psp.recent", empty),
    [prefs, savePrefs] = useSaved<Preferences>(
      "gamextore.psp.preferences",
      defaults,
    );
  const reduced = useReducedMotion();
  const input = useRef<HTMLInputElement>(null),
    opener = useRef<HTMLElement | null>(null),
    cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const filtered = useMemo(() => {
    let result = games.filter(
      (g) =>
        (category === "Todos los juegos" || g.genres.includes(category)) &&
        normalize(g.title).includes(normalize(query)) &&
        (tab !== "Favoritos" || favorites.includes(g.id)) &&
        (tab !== "Recientes" || recent.includes(g.id)) &&
        (tab !== "Explorar" || year === "Todos" || String(g.year) === year),
    );
    if (tab === "Recientes")
      result = result.toSorted(
        (a, b) => recent.indexOf(a.id) - recent.indexOf(b.id),
      );
    else if (tab === "Explorar" && sort !== "original")
      result = result.toSorted((a, b) =>
        sort === "year"
          ? b.year - a.year
          : sort === "genre"
            ? a.genres[0].localeCompare(b.genres[0], "es")
            : a.title.localeCompare(b.title, "es"),
      );
    return result;
  }, [category, query, tab, favorites, recent, sort, year]);
  const active = filtered.some((g) => g.id === selected)
    ? selected
    : filtered[0]?.id;
  const featured = games
    .filter((g) => featuredIds.includes(g.id))
    .toSorted((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape" && !detail) {
        setQuery("");
        input.current?.blur();
      }
    };
    const error = () =>
      setMessage("No se pudieron guardar los cambios en este navegador.");
    window.addEventListener("keydown", handler);
    window.addEventListener("gamextore-storage-error", error);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("gamextore-storage-error", error);
    };
  }, [detail]);
  useEffect(() => {
    const card = cardRefs.current.get(active);
    if (card) {
      const rail = card.closest(".rail");
      if (rail) {
        const left =
          card.offsetLeft - rail.clientWidth / 2 + card.offsetWidth / 2;
        rail.scrollTo({
          left: Math.max(0, left),
          behavior: reduced || prefs.intensity === 0 ? "instant" : "smooth",
        });
      }
    }
  }, [active, reduced, prefs.intensity]);
  function openGame(g: Game) {
    opener.current = document.activeElement as HTMLElement;
    setSelected(g.id);
    setDetail(g);
    saveRecent([g.id, ...recent.filter((id) => id !== g.id)].slice(0, 30));
  }
  function closeGame() {
    setDetail(null);
    requestAnimationFrame(() => opener.current?.focus());
  }
  function favorite(id: string) {
    saveFavorites(
      favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id],
    );
  }
  function regionKeys(
    e: KeyboardEvent<HTMLElement>,
    region: "tabs" | "categories",
  ) {
    const options =
      region === "tabs" ? tabs.map((t) => t[0]) : categories.map((c) => c[0]);
    const current = region === "tabs" ? tab : category;
    let index = options.indexOf(current as never);
    const direction =
      region === "tabs"
        ? e.key === "ArrowRight"
          ? 1
          : e.key === "ArrowLeft"
            ? -1
            : 0
        : e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowUp"
            ? -1
            : 0;
    if (direction) {
      e.preventDefault();
      index = (index + direction + options.length) % options.length;
      const buttons =
        e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
      buttons[index]?.focus();
      if (region === "tabs") setTab(options[index] as Tab);
      else setCategory(options[index]);
    }
  }
  function gameKeys(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const i = filtered.findIndex((g) => g.id === active);
      const g =
        filtered[
          (i + (e.key === "ArrowRight" ? 1 : -1) + filtered.length) %
            filtered.length
        ];
      if (g) {
        setSelected(g.id);
        cardRefs.current.get(g.id)?.focus();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      document.querySelector<HTMLButtonElement>(".xmb-tab.active")?.focus();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.querySelector<HTMLButtonElement>(".featured-game")?.focus();
    }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMessage("El navegador no permitió activar pantalla completa.");
    }
  }
  return (
    <MotionConfig
      reducedMotion={prefs.intensity === 0 ? "always" : "user"}
      transition={{ duration: 0.28 * prefs.intensity }}
    >
      <div
        className={`psp-app ${prefs.intensity === 0 ? "no-motion" : ""}`}
        style={{ "--motion-factor": prefs.intensity } as CSSProperties}
      >
        <Waves moving={prefs.waves && !reduced && prefs.intensity > 0} />
        <a className="skip-link" href="#catalog">
          Saltar al catálogo
        </a>
        <header className="psp-header">
          <Link
            href="/"
            className="psp-brand"
            aria-label="GameXtore — PlayStation Portable"
          >
            <Image
              src="/psp/logo.svg"
              alt="PSP"
              width={753}
              height={231}
              priority
            />
            <span>PlayStation Portable</span>
          </Link>
          <Clock />
        </header>
        <div className="xmb-top">
          <nav
            className="xmb-tabs"
            aria-label="Menú principal"
            role="tablist"
            onKeyDown={(e) => regionKeys(e, "tabs")}
          >
            {tabs.map(([name, Icon]) => (
              <button
                key={name}
                id={`tab-${name}`}
                className={`xmb-tab ${tab === name ? "active" : ""}`}
                role="tab"
                aria-selected={tab === name}
                aria-controls="catalog"
                tabIndex={tab === name ? 0 : -1}
                onClick={() => {
                  setTab(name);
                  setCategory("Todos los juegos");
                  setQuery("");
                }}
              >
                <Icon
                  className="tab-icon"
                  strokeWidth={name === "Juegos" ? 2.4 : 1.6}
                  fill={
                    name === "Juegos" || name === "Ajustes"
                      ? "currentColor"
                      : "none"
                  }
                  aria-hidden="true"
                />
                <span>{name}</span>
                {tab === name ? (
                  <motion.i
                    className="tab-indicator"
                    layoutId="tab-indicator"
                  />
                ) : null}
              </button>
            ))}
          </nav>
          <label className="search-box">
            <Search aria-hidden="true" size={25} />
            <span className="sr-only">Buscar juegos de PSP</span>
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar juegos de PSP..."
              aria-keyshortcuts="Control+k"
            />
            {query ? (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
              >
                <X size={18} />
              </button>
            ) : null}
          </label>
        </div>
        <div className="xmb-body">
          <aside
            className="categories"
            aria-label="Categorías de juegos"
            onKeyDown={(e) => regionKeys(e, "categories")}
          >
            {categories.map(([name, Icon]) => (
              <button
                key={name}
                className={`category ${category === name ? "active" : ""}`}
                aria-pressed={category === name}
                onClick={() => {
                  setCategory(name);
                  if (tab === "Ajustes") setTab("Juegos");
                }}
              >
                {category === name ? (
                  <motion.span
                    className="category-highlight"
                    layoutId="category-highlight"
                  />
                ) : null}
                <Icon aria-hidden="true" size={30} strokeWidth={2} />
                <span>{name}</span>
                <small>
                  {
                    games.filter(
                      (g) =>
                        name === "Todos los juegos" || g.genres.includes(name),
                    ).length
                  }
                </small>
              </button>
            ))}
          </aside>
          <main
            id="catalog"
            className="catalog"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            tabIndex={-1}
          >
            {tab === "Ajustes" ? (
              <motion.section
                className="settings-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1>Ajustes</h1>
                <p>Haz que GameXtore se sienta como tu PSP.</p>
                <label className="setting-row">
                  <span>
                    Intensidad de animaciones{" "}
                    <small>{Math.round(prefs.intensity * 100)} %</small>
                  </span>
                  <input
                    aria-label="Intensidad de animaciones"
                    type="range"
                    min="0"
                    max="1"
                    step=".1"
                    value={prefs.intensity}
                    onChange={(e) =>
                      savePrefs({ ...prefs, intensity: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="setting-row">
                  <span>Movimiento de las ondas</span>
                  <input
                    type="checkbox"
                    checked={prefs.waves}
                    onChange={(e) =>
                      savePrefs({ ...prefs, waves: e.target.checked })
                    }
                  />
                </label>
                {reduced ? (
                  <p>
                    Tu dispositivo solicita reducir el movimiento. Esa
                    preferencia tiene prioridad.
                  </p>
                ) : null}
                <button className="setting-row" onClick={fullscreen}>
                  <span>Pantalla completa</span>
                  <Maximize size={21} />
                </button>
                <button
                  className="setting-row"
                  onClick={() => {
                    savePrefs(defaults);
                    setMessage("Preferencias restablecidas.");
                  }}
                >
                  <span>Restablecer preferencias</span>
                  <RotateCcw size={21} />
                </button>
                <a
                  className="credits-link"
                  href="/psp/resources.json"
                  target="_blank"
                  rel="noreferrer"
                >
                  Fuentes y estado de los recursos ↗
                </a>
              </motion.section>
            ) : (
              <>
                {tab === "Explorar" ? (
                  <div className="explore-filters">
                    <h1>Explorar</h1>
                    <label>
                      Ordenar
                      <select
                        aria-label="Ordenar"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="original">Selección original</option>
                        <option value="name">Nombre · A–Z</option>
                        <option value="genre">Género</option>
                        <option value="year">Año · más recientes</option>
                      </select>
                    </label>
                    <label>
                      Año
                      <select
                        aria-label="Año"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option>Todos</option>
                        {[...new Set(games.map((g) => g.year))]
                          .toSorted()
                          .map((y) => (
                            <option key={y}>{y}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                ) : null}
                {tab === "Favoritos" || tab === "Recientes" ? (
                  <h1 className="view-heading">{tab}</h1>
                ) : null}
                <p className="sr-only" role="status">
                  {filtered.length} juegos
                  {category !== "Todos los juegos" ? ` de ${category}` : ""}
                </p>
                {filtered.length ? (
                  <Rail
                    label="Catálogo de juegos PSP"
                    className="main-rail"
                    onKeyDown={gameKeys}
                  >
                    {filtered.map((game, i) => (
                      <motion.article
                        className={`game ${active === game.id ? "selected" : ""}`}
                        key={game.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(i, 5) * 0.04 * prefs.intensity,
                        }}
                      >
                        <button
                          className="game-select"
                          ref={(el) => {
                            if (el) cardRefs.current.set(game.id, el);
                            else cardRefs.current.delete(game.id);
                          }}
                          aria-label={`Abrir ${game.title}`}
                          aria-current={active === game.id ? "true" : undefined}
                          tabIndex={active === game.id ? 0 : -1}
                          onFocus={() => setSelected(game.id)}
                          onClick={() => openGame(game)}
                        >
                          <motion.div
                            className="game-cover"
                            layoutId={`cover-${game.id}`}
                          >
                            <Cover game={game} priority={i < 6} />
                          </motion.div>
                          <h2>{game.title}</h2>
                          <p>{game.genres.join(" / ")}</p>
                          <span className="platform-chip">PSP</span>
                        </button>
                        <button
                          className={`favorite-toggle ${favorites.includes(game.id) ? "saved" : ""}`}
                          aria-label={`${favorites.includes(game.id) ? "Quitar" : "Guardar"} ${game.title} ${favorites.includes(game.id) ? "de" : "en"} favoritos`}
                          aria-pressed={favorites.includes(game.id)}
                          onClick={() => favorite(game.id)}
                        >
                          <Star
                            size={17}
                            fill={
                              favorites.includes(game.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </motion.article>
                    ))}
                  </Rail>
                ) : (
                  <div className="empty-state">
                    <Search size={34} />
                    <h2>
                      {tab === "Favoritos"
                        ? "Aún no hay favoritos"
                        : tab === "Recientes"
                          ? "Tu historia empieza aquí"
                          : "No se encontraron juegos"}
                    </h2>
                    <p>
                      {query || category !== "Todos los juegos"
                        ? "Prueba otro nombre o una categoría diferente."
                        : tab === "Favoritos"
                          ? "Guarda un juego con la estrella para encontrarlo aquí."
                          : "Los juegos que abras aparecerán aquí."}
                    </p>
                    {query || category !== "Todos los juegos" ? (
                      <button
                        className="glass-action"
                        onClick={() => {
                          setQuery("");
                          setCategory("Todos los juegos");
                        }}
                      >
                        Limpiar filtros
                      </button>
                    ) : null}
                  </div>
                )}
                {tab === "Juegos" &&
                !query &&
                category === "Todos los juegos" ? (
                  <section className="featured">
                    <h2>Destacados</h2>
                    <Rail
                      label="Juegos destacados"
                      className="featured-rail"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp") {
                          e.preventDefault();
                          cardRefs.current.get(active)?.focus();
                        }
                        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          const buttons = Array.from(
                            e.currentTarget.querySelectorAll<HTMLButtonElement>(
                              "button",
                            ),
                          );
                          const i = buttons.indexOf(
                            document.activeElement as HTMLButtonElement,
                          );
                          buttons[
                            (i +
                              (e.key === "ArrowRight" ? 1 : -1) +
                              buttons.length) %
                              buttons.length
                          ]?.focus();
                        }
                      }}
                    >
                      {featured.map((game) => (
                        <button
                          className="featured-game"
                          key={game.id}
                          aria-label={`Abrir ${game.title}`}
                          onClick={() => openGame(game)}
                        >
                          <Cover game={game} />
                        </button>
                      ))}
                    </Rail>
                  </section>
                ) : null}
              </>
            )}
          </main>
        </div>
        <div className="keyboard-guide" aria-hidden="true">
          <span>
            <ChevronRight size={13} /> Enter · Abrir
          </span>
          <span>← → · Navegar</span>
          <span>Ctrl K · Buscar</span>
        </div>
        <AnimatePresence>
          {detail ? (
            <Detail
              key={detail.id}
              game={detail}
              onClose={closeGame}
              favorite={favorites.includes(detail.id)}
              onFavorite={() => favorite(detail.id)}
            />
          ) : null}
        </AnimatePresence>
        {message ? (
          <div className="toast" role="status">
            {message}
            <button aria-label="Cerrar aviso" onClick={() => setMessage("")}>
              <X size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </MotionConfig>
  );
}
