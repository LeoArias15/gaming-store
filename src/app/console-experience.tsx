"use client";
import "./console.css";
import {
  useEffect,
  useRef,
  useState,
  ViewTransition,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import platforms from "../data/consoles.json";
export default function Experience({ platformId }: { platformId?: string }) {
  const [index, setIndex] = useState(
    Math.max(
      0,
      platforms.findIndex((p) => p.id === (platformId || "psp")),
    ),
  );
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [brand, setBrand] = useState("Todas");
  const reduced = useReducedMotion(),
    pointer = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.from(".intro, .info, footer", {
        opacity: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
      });
    }, root);
    return () => context.revert();
  }, [reduced]);
  const mx = useMotionValue(0),
    my = useMotionValue(0),
    x = useSpring(mx, { stiffness: 80, damping: 24 }),
    y = useSpring(my, { stiffness: 80, damping: 24 });
  const rx = useTransform(y, [-1, 1], [5, -5]),
    ry = useTransform(x, [-1, 1], [-8, 8]);
  const active = platforms[index],
    accent =
      active.brand === "Nintendo"
        ? "#f77b73"
        : active.brand === "Microsoft"
          ? "#b3df88"
          : "#b7c4ff";
  const move = (d: number) => setIndex((n) => (n + d + 26) % 26);
  const filtered = platforms.filter(
    (p) =>
      (brand === "Todas" || p.brand === brand) &&
      `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        className="experience"
        style={{ "--accent": accent } as CSSProperties}
      >
        <a className="skip" href="#main">
          Saltar al contenido
        </a>
        <header>
          <Link href="/" className="wordmark">
            GAME<span>X</span>TORE<sup>®</sup>
          </Link>
          <nav aria-label="Principal">
            <Link href="/">Explorar</Link>
            <button
              aria-expanded={open}
              aria-controls="library"
              onClick={() => setOpen(!open)}
            >
              Plataformas <small>26</small>
            </button>
          </nav>
          <button
            aria-label="Buscar plataformas"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() =>
                document.getElementById("search")?.focus(),
              );
            }}
          >
            <Search size={19} />
          </button>
        </header>
        <main id="main">
          <div className="intro">
            <span>LA COLECCIÓN GAMEXTORE</span>
            <p>
              Grandes consolas.
              <br />
              Historias que siguen jugando.
            </p>
          </div>
          <section
            className="showcase"
            aria-label="Carrusel de consolas"
            aria-roledescription="carrusel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                move(1);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                move(-1);
              }
              if (e.key === "Home") setIndex(0);
              if (e.key === "End") setIndex(25);
            }}
            onPointerMove={(e) => {
              if (!reduced && e.pointerType === "mouse") {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
                my.set(((e.clientY - r.top) / r.height) * 2 - 1);
              }
            }}
            onPointerLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            onPointerDown={(e) => {
              pointer.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (
                pointer.current !== null &&
                Math.abs(e.clientX - pointer.current) > 55
              )
                move(e.clientX < pointer.current ? 1 : -1);
              pointer.current = null;
            }}
            onPointerCancel={() => {
              pointer.current = null;
            }}
          >
            <div className="ambient" />
            <span className="backdrop" aria-hidden="true">
              {active.name}
            </span>
            <div className="stage">
              {[-1, 0, 1].map((offset) => {
                const p = platforms[(index + offset + 26) % 26];
                return (
                  <motion.div
                    key={p.id}
                    className="slot"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      x: `${offset * 82}%`,
                      scale: offset ? 0.52 : 1,
                      rotateY: offset * -28,
                      z: offset ? -160 : 80,
                      opacity: offset ? 0.32 : 1,
                    }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 90, damping: 23 }
                    }
                    style={{ zIndex: offset ? 1 : 3 }}
                  >
                    <motion.div
                      className="tilt"
                      style={
                        !offset && !reduced
                          ? { rotateX: rx, rotateY: ry }
                          : undefined
                      }
                    >
                      <motion.div
                        className="float"
                        animate={
                          reduced
                            ? {}
                            : { y: [0, -14, 0], rotateZ: [-2, 0, -2] }
                        }
                        transition={{
                          duration: 7,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {p.path ? (
                          <ViewTransition
                            name={`console-${p.id}`}
                            share="morph"
                            default="none"
                          >
                            <div className="image-wrap">
                              <Image
                                src={p.path}
                                alt={p.alt}
                                width={p.width || 1200}
                                height={p.height || 800}
                                priority={!offset}
                                draggable={false}
                                sizes="(max-width:700px) 82vw, 53vw"
                              />
                            </div>
                          </ViewTransition>
                        ) : (
                          <div className="pending">
                            <strong>{p.name}</strong>
                            <small>Imagen autorizada pendiente</small>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                    <div className="shadow" />
                    {offset ? (
                      <button
                        className="neighbor"
                        tabIndex={-1}
                        aria-label={`Seleccionar ${p.name}`}
                        onClick={() => move(offset)}
                      />
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
            <div className="stage-caption">
              <span>
                {active.brand} · {active.year}
              </span>
              <span>ARRASTRA PARA EXPLORAR →</span>
            </div>
          </section>
          <section className="info">
            <div>
              <p className="eyebrow">
                {platformId ? "TU PRÓXIMA PARTIDA" : "ELIGE TU UNIVERSO"}
              </p>
              <h1 aria-live="polite">
                {active.name}
                <sup>™</sup>
              </h1>
              <p>
                {active.id === "psp"
                  ? "Todo un universo. En la palma de tu mano."
                  : "Vuelve al lugar donde comienza tu próxima aventura."}
              </p>
            </div>
            <div className="actions">
              <Link
                className="primary"
                href={`/platform/${active.id}`}
                transitionTypes={["nav-forward"]}
              >
                Explorar plataforma
                <ArrowUpRight size={20} />
              </Link>
              <div className="arrows">
                <button aria-label="Consola anterior" onClick={() => move(-1)}>
                  <ArrowLeft size={20} />
                </button>
                <span>
                  {String(index + 1).padStart(2, "0")} <b>/ 26</b>
                </span>
                <button aria-label="Consola siguiente" onClick={() => move(1)}>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>
          {platformId ? (
            <section className="catalog">
              <h2>Espacio {active.name}</h2>
              <p>
                Plataforma lista para conectar su catálogo. Este repositorio aún
                no contiene inventario de juegos ni integración de compra.
              </p>
              <Link href="/" transitionTypes={["nav-back"]}>
                ← Volver a la colección
              </Link>
            </section>
          ) : null}
          <footer>
            <span>26 plataformas. Una misma pasión.</span>
            <button
              onClick={() => setOpen(!open)}
              aria-controls="library"
              aria-expanded={open}
            >
              {open ? "Cerrar colección" : "Ver toda la colección"}{" "}
              <ArrowRight size={15} />
            </button>
            <a href="/consoles/manifest.json" target="_blank" rel="noreferrer">
              Créditos de imágenes ↗
            </a>
          </footer>
          {open ? (
            <section id="library" className="library">
              <div className="library-title">
                <h2>Tu siguiente universo.</h2>
                <button
                  aria-label="Cerrar colección"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </button>
              </div>
              <div className="filters">
                <label>
                  <span className="sr-only">Buscar plataformas</span>
                  <Search size={18} />
                  <input
                    id="search"
                    placeholder="Buscar plataforma…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Fabricante"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  {[
                    "Todas",
                    "Sony",
                    "Nintendo",
                    "Sega",
                    "Microsoft",
                    "Atari",
                  ].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="platform-list">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    aria-pressed={active.id === p.id}
                    onClick={() => {
                      setIndex(platforms.indexOf(p));
                      setOpen(false);
                      document.querySelector<HTMLElement>(".showcase")?.focus();
                    }}
                  >
                    <span>{p.name}</span>
                    <small>
                      {p.brand} · {p.year}
                      {!p.path ? " · Imagen pendiente" : ""}
                    </small>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
                {!filtered.length ? (
                  <p>No hay plataformas con esos filtros.</p>
                ) : null}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </MotionConfig>
  );
}
