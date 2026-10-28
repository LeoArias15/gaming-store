"use client";
import "./wii.css";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import {
  Gamepad2,
  Grid3X3,
  Star,
  Clock3,
  Settings,
  Battery,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  House,
  Mail,
  Search,
  X,
  ArrowLeft,
  Volume2,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { wiiGames, type WiiGame } from "../data/wii-games";
const tabs = [
  ["Juegos", Gamepad2],
  ["Explorar", Grid3X3],
  ["Favoritos", Star],
  ["Recientes", Clock3],
  ["Ajustes", Settings],
] as const;
type Tab = (typeof tabs)[number][0];
type Prefs = {
  sound: boolean;
  volume: number;
  animations: boolean;
  light: number;
  background: boolean;
  pointer: boolean;
};
const defaults: Prefs = {
  sound: true,
  volume: 0.3,
  animations: true,
  light: 0.7,
  background: true,
  pointer: true,
};
const empty: string[] = [];
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("wii-store", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("wii-store", cb);
  };
}
function useStore<T>(key: string, fallback: T): [T, (v: T) => void] {
  const get = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, get, () => null);
  const value = useMemo(() => {
    try {
      const p = raw ? JSON.parse(raw) : fallback;
      if (Array.isArray(fallback))
        return (
          Array.isArray(p)
            ? p.filter((id: unknown) => wiiGames.some((g) => g.id === id))
            : fallback
        ) as T;
      if (
        typeof p.sound === "boolean" &&
        typeof p.volume === "number" &&
        typeof p.animations === "boolean" &&
        typeof p.light === "number" &&
        typeof p.background === "boolean" &&
        typeof p.pointer === "boolean"
      )
        return {
          ...p,
          volume: Math.max(0, Math.min(1, p.volume)),
          light: Math.max(0, Math.min(1, p.light)),
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
        window.dispatchEvent(new Event("wii-store"));
      } catch {
        window.dispatchEvent(new Event("wii-store-error"));
      }
    },
    [key],
  );
  return [value, save];
}
function useSounds(prefs: Prefs) {
  const audio = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      void audio.current?.close().catch(() => {});
    },
    [],
  );
  return useCallback(
    (kind: "move" | "confirm" | "back" | "error") => {
      if (!prefs.sound || prefs.volume === 0) return;
      try {
        audio.current ??= new AudioContext();
        const ctx = audio.current;
        void ctx.resume().catch(() => {});
        const notes =
          kind === "confirm"
            ? [660, 880, 1320]
            : kind === "back"
              ? [660, 440]
              : kind === "error"
                ? [220, 180]
                : [880];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator(),
            gain = ctx.createGain(),
            start = ctx.currentTime + i * 0.065;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.12 * prefs.volume, start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.15);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
          };
        });
      } catch {
        /* Audio is optional when the browser does not expose Web Audio. */
      }
    },
    [prefs.sound, prefs.volume],
  );
}
function onlineSubscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}
function timeSubscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
function timeSnapshot() {
  const d = new Date();
  return `${d.toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "2-digit" })}  ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}
function WiiStatus() {
  const online = useSyncExternalStore(
    onlineSubscribe,
    () => navigator.onLine,
    () => true,
  );
  const time = useSyncExternalStore(timeSubscribe, timeSnapshot, () => "");
  const Connection = online ? Wifi : WifiOff;
  return (
    <div className="wii-status">
      <time>{time || "—/—  —:—"}</time>
      <Battery
        size={35}
        strokeWidth={1.4}
        aria-label="Nivel de batería no disponible"
      />
      <Connection
        size={26}
        aria-label={online ? "Navegador conectado" : "Navegador sin conexión"}
      />
    </div>
  );
}
function Art({
  game,
  priority = false,
}: {
  game: WiiGame;
  priority?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  return game.cover && !broken ? (
    <Image
      src={game.cover}
      alt={`Carátula de ${game.title} para Nintendo Wii`}
      width={game.coverWidth}
      height={game.coverHeight}
      priority={priority}
      sizes="(max-width:700px) 170px, 15vw"
      draggable={false}
      onError={() => setBroken(true)}
    />
  ) : (
    <div className="wii-cover-missing">
      <span>Carátula no disponible</span>
      <small>{game.title}</small>
    </div>
  );
}
function WiiDetails({
  game,
  close,
  favorite,
  toggle,
}: {
  game: WiiGame;
  close: () => void;
  favorite: boolean;
  toggle: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const el = ref.current;
    return () => el?.close();
  }, []);
  return (
    <motion.dialog
      ref={ref}
      className="wii-detail"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onCancel={close}
    >
      <button className="wii-detail-back" onClick={close}>
        <ArrowLeft size={22} />
        Regresar <kbd>Esc</kbd>
      </button>
      <div className="wii-detail-grid">
        <motion.div
          className="wii-detail-art"
          layoutId={`wii-cover-${game.id}`}
        >
          <Art game={game} />
        </motion.div>
        <div>
          <span className="wii-detail-platform">Nintendo Wii</span>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <dl>
            <div>
              <dt>Género</dt>
              <dd>{game.genre}</dd>
            </div>
            <div>
              <dt>Año de lanzamiento</dt>
              <dd>{game.year}</dd>
            </div>
            <div>
              <dt>Desarrollador</dt>
              <dd>{game.developer}</dd>
            </div>
          </dl>
          <button
            className="wii-action"
            aria-pressed={favorite}
            onClick={toggle}
          >
            <Star size={21} fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          </button>
          {game.source ? (
            <a
              className="wii-source"
              href={game.source}
              target="_blank"
              rel="noreferrer"
            >
              Fuente de la carátula y derechos ↗
            </a>
          ) : null}
        </div>
      </div>
    </motion.dialog>
  );
}
export default function WiiExperience() {
  const [tab, setTab] = useState<Tab>("Juegos"),
    [selected, setSelected] = useState("twilight-princess"),
    [detail, setDetail] = useState<WiiGame | null>(null),
    [query, setQuery] = useState(""),
    [genre, setGenre] = useState("Todos"),
    [year, setYear] = useState("Todos"),
    [sort, setSort] = useState("original"),
    [notice, setNotice] = useState("");
  const [favorites, saveFavorites] = useStore<string[]>(
      "gamextore.wii.favorites",
      empty,
    ),
    [recent, saveRecent] = useStore<string[]>("gamextore.wii.recent", empty),
    [prefs, savePrefs] = useStore<Prefs>("gamextore.wii.preferences", defaults);
  const reduced = useReducedMotion(),
    play = useSounds(prefs),
    rail = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    opener = useRef<HTMLElement | null>(null),
    cards = useRef(new Map<string, HTMLButtonElement>());
  const [width, setWidth] = useState(1648);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);
  const visible = useMemo(() => {
    let rows = wiiGames.filter(
      (g) =>
        (tab !== "Favoritos" || favorites.includes(g.id)) &&
        (tab !== "Recientes" || recent.includes(g.id)) &&
        (tab !== "Explorar" ||
          (fold(g.title).includes(fold(query)) &&
            (genre === "Todos" || g.genre === genre) &&
            (year === "Todos" || String(g.year) === year))),
    );
    if (tab === "Recientes")
      rows = rows.toSorted(
        (a, b) => recent.indexOf(a.id) - recent.indexOf(b.id),
      );
    if (tab === "Explorar" && sort === "name")
      rows = rows.toSorted((a, b) => a.title.localeCompare(b.title, "es"));
    if (tab === "Explorar" && sort === "year")
      rows = rows.toSorted((a, b) => b.year - a.year);
    return rows;
  }, [tab, query, genre, year, sort, favorites, recent]);
  const active = visible.find((g) => g.id === selected) || visible[0];
  const perPage = width < 600 ? 2 : width < 1000 ? 4 : 6;
  const pages = Math.max(1, Math.ceil(visible.length / perPage));
  const page = active ? Math.floor(visible.indexOf(active) / perPage) : 0;
  useEffect(() => {
    const card = active ? cards.current.get(active.id) : null,
      el = rail.current;
    if (card && el) {
      const left = card.offsetLeft - el.clientWidth / 2 + card.offsetWidth / 2;
      el.scrollTo({
        left: Math.max(0, left),
        behavior: reduced || !prefs.animations ? "instant" : "smooth",
      });
    }
  }, [active, reduced, prefs.animations, tab, width]);
  function toggle(id: string) {
    saveFavorites(
      favorites.includes(id)
        ? favorites.filter((f) => f !== id)
        : [...favorites, id],
    );
    play("confirm");
  }
  function open(g: WiiGame | undefined) {
    if (!g) {
      play("error");
      return;
    }
    opener.current = document.activeElement as HTMLElement;
    setSelected(g.id);
    saveRecent([g.id, ...recent.filter((id) => id !== g.id)].slice(0, 30));
    setDetail(g);
    play("confirm");
  }
  function close() {
    setDetail(null);
    play("back");
    requestAnimationFrame(() => opener.current?.focus());
  }
  function move(delta: number, focus = false) {
    if (!visible.length) return;
    const i = visible.findIndex((g) => g.id === active?.id),
      next = visible[(i + delta + visible.length) % visible.length];
    setSelected(next.id);
    play("move");
    if (focus) cards.current.get(next.id)?.focus();
  }
  const moveRef = useRef(move),
    toggleRef = useRef(toggle);
  useEffect(() => {
    moveRef.current = move;
    toggleRef.current = toggle;
  });
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        Boolean(
          e.target.closest("input,select,textarea,[contenteditable=true]"),
        );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setTab("Explorar");
        requestAnimationFrame(() => input.current?.focus());
        return;
      }
      if (typing) {
        if (e.key === "Escape") setQuery("");
        return;
      }
      if (detail) return;
      if (e.key.toLowerCase() === "f" && active) {
        e.preventDefault();
        toggleRef.current(active.id);
      }
      if (e.key === "Escape" && tab !== "Juegos") {
        setTab("Juegos");
        setQuery("");
      }
    };
    const error = () =>
      setNotice("No se pudieron guardar las preferencias en este navegador.");
    window.addEventListener("keydown", handler);
    window.addEventListener("wii-store-error", error);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("wii-store-error", error);
    };
  }, [active, detail, tab]);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [tab]);
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      play("confirm");
    } catch {
      setNotice("El navegador no permitió activar pantalla completa.");
      play("error");
    }
  }
  function tabKeys(e: KeyboardEvent<HTMLElement>) {
    const i = tabs.findIndex((t) => t[0] === tab);
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const n =
        (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      setTab(tabs[n][0]);
      e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[n]?.focus();
      play("move");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (active) cards.current.get(active.id)?.focus();
    }
  }
  return (
    <MotionConfig reducedMotion={!prefs.animations ? "always" : "user"}>
      <div
        className={`wii-app ${prefs.pointer ? "wii-pointer" : ""} ${!prefs.animations ? "wii-still" : ""} ${prefs.background && !reduced && prefs.animations ? "wii-background-motion" : ""}`}
        style={{ "--wii-light": prefs.light } as CSSProperties}
      >
        <a className="wii-skip" href="#wii-content">
          Saltar al catálogo Wii
        </a>
        <div className="wii-ambient" aria-hidden="true" />
        <svg
          className="wii-back-curves"
          viewBox="0 0 1648 928"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 170 Q824 355 1648 168 L1648 580 Q824 440 0 575Z"
            fill="#dae4ec"
            opacity=".47"
          />
          <path
            d="M0 330 Q824 520 1648 330 L1648 440 Q824 340 0 440Z"
            fill="#b4e3f9"
            opacity=".75"
          />
        </svg>
        <header className="wii-header">
          <Link
            href="/"
            className="wii-logo"
            aria-label="GameXtore — volver a consolas"
          >
            <Image
              src="/assets/wii/logo.svg"
              alt="Wii"
              width={282}
              height={123}
              priority
            />
            <span>GameXtore</span>
          </Link>
          <WiiStatus />
          <nav
            className="wii-tabs"
            role="tablist"
            aria-label="Menú Wii"
            onKeyDown={tabKeys}
          >
            {tabs.map(([name, Icon], i) => (
              <motion.button
                key={name}
                id={`wii-tab-${name}`}
                className={`wii-tab ${tab === name ? "active" : ""}`}
                role="tab"
                aria-selected={tab === name}
                aria-controls="wii-content"
                tabIndex={tab === name ? 0 : -1}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35 }}
                whileHover={{ scale: 1.025 }}
                onClick={() => {
                  setTab(name);
                  play("move");
                }}
              >
                <Icon
                  aria-hidden="true"
                  fill={
                    ["Juegos", "Favoritos", "Ajustes"].includes(name)
                      ? "currentColor"
                      : "none"
                  }
                  strokeWidth={name === "Explorar" ? 2.8 : 2}
                />
                <span>{name}</span>
              </motion.button>
            ))}
          </nav>
        </header>
        <main
          id="wii-content"
          className={`wii-content ${tab === "Explorar" ? "wii-exploring" : ""}`}
          role="tabpanel"
          aria-labelledby={`wii-tab-${tab}`}
        >
          {tab === "Ajustes" ? (
            <section className="wii-settings">
              <h1>Ajustes Wii</h1>
              <div className="wii-settings-grid">
                <label>
                  Efectos de sonido
                  <input
                    type="checkbox"
                    checked={prefs.sound}
                    onChange={(e) => {
                      savePrefs({ ...prefs, sound: e.target.checked });
                    }}
                  />
                </label>
                <label>
                  Volumen
                  <input
                    aria-label="Volumen"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={prefs.volume}
                    onChange={(e) =>
                      savePrefs({ ...prefs, volume: Number(e.target.value) })
                    }
                  />
                  <output>{Math.round(prefs.volume * 100)} %</output>
                </label>
                <button
                  className="wii-settings-test"
                  onClick={() => play("confirm")}
                  disabled={!prefs.sound || prefs.volume === 0}
                >
                  <Volume2 size={19} />
                  Probar sonido
                </button>
                <label>
                  Animaciones
                  <input
                    type="checkbox"
                    checked={prefs.animations}
                    onChange={(e) =>
                      savePrefs({ ...prefs, animations: e.target.checked })
                    }
                  />
                </label>
                <label>
                  Iluminación
                  <input
                    aria-label="Iluminación"
                    type="range"
                    min="0"
                    max="1"
                    step=".1"
                    value={prefs.light}
                    onChange={(e) =>
                      savePrefs({ ...prefs, light: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Movimiento del fondo
                  <input
                    type="checkbox"
                    checked={prefs.background}
                    onChange={(e) =>
                      savePrefs({ ...prefs, background: e.target.checked })
                    }
                  />
                </label>
                <label>
                  Puntero de manita
                  <input
                    type="checkbox"
                    checked={prefs.pointer}
                    onChange={(e) =>
                      savePrefs({ ...prefs, pointer: e.target.checked })
                    }
                  />
                </label>
                <button onClick={fullscreen}>
                  <Maximize size={20} />
                  Pantalla completa
                </button>
                <button
                  onClick={() => {
                    savePrefs(defaults);
                    setNotice("Preferencias Wii restablecidas.");
                  }}
                >
                  <RotateCcw size={20} />
                  Restablecer preferencias
                </button>
              </div>
              {reduced ? (
                <p>
                  La reducción de movimiento de tu dispositivo tiene prioridad.
                </p>
              ) : null}
              <a
                className="wii-credits"
                href="/assets/wii/resources.json"
                target="_blank"
                rel="noreferrer"
              >
                Recursos visuales y derechos ↗
              </a>
            </section>
          ) : (
            <>
              {tab === "Explorar" ? (
                <div className="wii-filters">
                  <label className="wii-search">
                    <Search size={20} />
                    <input
                      ref={input}
                      aria-label="Buscar juegos Wii"
                      placeholder="Buscar juegos de Wii…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query ? (
                      <button
                        aria-label="Limpiar búsqueda"
                        onClick={() => setQuery("")}
                      >
                        <X size={18} />
                      </button>
                    ) : null}
                  </label>
                  <select
                    aria-label="Género Wii"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <option>Todos</option>
                    {[...new Set(wiiGames.map((g) => g.genre))].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Año Wii"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option>Todos</option>
                    {[...new Set(wiiGames.map((g) => g.year))]
                      .toSorted()
                      .map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                  </select>
                  <select
                    aria-label="Orden Wii"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="original">Orden original</option>
                    <option value="name">Nombre · A–Z</option>
                    <option value="year">Año</option>
                  </select>
                </div>
              ) : null}
              {tab === "Favoritos" || tab === "Recientes" ? (
                <h1 className="wii-view-title">{tab}</h1>
              ) : null}
              {visible.length ? (
                <>
                  <button
                    className="wii-arrow previous"
                    aria-label="Juego Wii anterior"
                    onClick={() => move(-1)}
                  >
                    <ChevronLeft fill="currentColor" strokeWidth={3} />
                  </button>
                  <div
                    className="wii-rail"
                    ref={rail}
                    role="region"
                    aria-label="Carrusel de juegos Wii"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        e.preventDefault();
                        moveRef.current(e.key === "ArrowRight" ? 1 : -1, true);
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        document
                          .querySelector<HTMLButtonElement>(".wii-tab.active")
                          ?.focus();
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        document
                          .querySelector<HTMLButtonElement>(".wii-start")
                          ?.focus();
                      }
                    }}
                  >
                    {visible.map((game, i) => (
                      <motion.article
                        key={game.id}
                        className={`wii-game ${active?.id === game.id ? "selected" : ""}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: Math.min(i, 5) * 0.055,
                        }}
                      >
                        <button
                          ref={(el) => {
                            if (el) cards.current.set(game.id, el);
                            else cards.current.delete(game.id);
                          }}
                          className="wii-game-select"
                          aria-label={`Seleccionar ${game.title}`}
                          aria-current={
                            active?.id === game.id ? "true" : undefined
                          }
                          tabIndex={active?.id === game.id ? 0 : -1}
                          onFocus={() => setSelected(game.id)}
                          onClick={() => {
                            setSelected(game.id);
                            play("move");
                          }}
                          onDoubleClick={() => open(game)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              open(game);
                            }
                          }}
                        >
                          <motion.div
                            className={`wii-case ${game.id !== "wii-sports" ? "wii-case-header" : ""}`}
                            layoutId={`wii-cover-${game.id}`}
                          >
                            {game.id !== "wii-sports" ? (
                              <span
                                className="wii-case-brand"
                                aria-hidden="true"
                              >
                                <Image
                                  src="/assets/wii/logo.svg"
                                  alt=""
                                  width={45}
                                  height={22}
                                />
                              </span>
                            ) : null}
                            <Art game={game} priority={i < 6} />
                          </motion.div>
                          <h2>{game.title}</h2>
                          <p>{game.genre}</p>
                        </button>
                      </motion.article>
                    ))}
                  </div>
                  <button
                    className="wii-arrow next"
                    aria-label="Juego Wii siguiente"
                    onClick={() => move(1)}
                  >
                    <ChevronRight fill="currentColor" strokeWidth={3} />
                  </button>
                  <div className="wii-dots" aria-label="Páginas del catálogo">
                    {Array.from({ length: pages }, (_, i) => (
                      <button
                        key={i}
                        aria-label={`Página ${i + 1} de ${pages}`}
                        aria-current={page === i ? "page" : undefined}
                        onClick={() => {
                          setSelected(visible[i * perPage].id);
                          play("move");
                        }}
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="wii-empty">
                  <Star size={35} />
                  <h1>
                    {tab === "Favoritos"
                      ? "Todavía no hay favoritos"
                      : tab === "Recientes"
                        ? "Todavía no hay juegos recientes"
                        : "No encontramos juegos"}
                  </h1>
                  <p>
                    {tab === "Favoritos"
                      ? "Abre una ficha o pulsa F para guardar tu selección."
                      : tab === "Recientes"
                        ? "Los juegos que consultes aparecerán aquí."
                        : "Prueba otro nombre, género o año."}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
        <footer className="wii-footer">
          <svg
            className="wii-footer-wave"
            viewBox="0 0 1648 250"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="wii-footer-bg" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#d9dfe4" />
                <stop offset=".44" stopColor="#f4f6f9" />
                <stop offset="1" stopColor="#e7ecf1" />
              </linearGradient>
            </defs>
            <path
              d="M0 8 C360 0 270 74 824 72 S1280 2 1648 8 L1648 250H0Z"
              fill="url(#wii-footer-bg)"
            />
            <path
              d="M0 8 C360 0 270 74 824 72 S1280 2 1648 8"
              fill="none"
              stroke="#51bfee"
              strokeWidth="8"
            />
            <path
              d="M0 15 C360 7 270 81 824 79 S1280 9 1648 15"
              fill="none"
              stroke="white"
              strokeWidth="3"
            />
          </svg>
          <div className="wii-footer-controls">
            <Link
              className="wii-round wii-home"
              href="/"
              aria-label="Volver a consolas"
            >
              <Image
                src="/assets/wii/logo.svg"
                alt="Wii"
                width={100}
                height={44}
              />
            </Link>
            <button
              className="wii-sd"
              aria-label="Información de almacenamiento local"
              onClick={() => {
                setNotice(
                  "Favoritos, recientes y preferencias se guardan en este navegador. No se accede a una tarjeta SD.",
                );
                play("confirm");
              }}
            >
              <svg
                width="61"
                height="76"
                viewBox="0 0 61 76"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 5h31l11 11v53H8V17l2-2Z"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 9v13m9-13v13m9-13v13"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <span>SD</span>
            </button>
            <div className="wii-capsules">
              <Link
                className="wii-capsule"
                href="/"
                onClick={() => play("back")}
              >
                <span>
                  <Plus size={33} strokeWidth={4} />
                </span>
                Menú Wii
              </Link>
              <button
                className="wii-capsule wii-start"
                onClick={() => open(active)}
                disabled={!active || tab === "Ajustes"}
              >
                <span>
                  <House size={30} fill="white" />
                </span>
                Iniciar
              </button>
            </div>
            <button
              className="wii-round wii-mail"
              aria-label="Mensajes"
              onClick={() => {
                setNotice("No hay un servicio de mensajes conectado.");
                play("confirm");
              }}
            >
              <Mail size={53} fill="currentColor" strokeWidth={1} />
            </button>
          </div>
        </footer>
        <AnimatePresence>
          {detail ? (
            <WiiDetails
              key={detail.id}
              game={detail}
              close={close}
              favorite={favorites.includes(detail.id)}
              toggle={() => toggle(detail.id)}
            />
          ) : null}
        </AnimatePresence>
        {notice ? (
          <div className="wii-notice" role="status">
            {notice}
            <button
              aria-label="Cerrar aviso Wii"
              onClick={() => {
                setNotice("");
                play("back");
              }}
            >
              <X size={20} />
            </button>
          </div>
        ) : null}
      </div>
    </MotionConfig>
  );
}
