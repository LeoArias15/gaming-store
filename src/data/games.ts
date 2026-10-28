export type Game = {
  id: string;
  title: string;
  genres: string[];
  year: number;
  developer: string;
  description: string;
  cover: string | null;
  source: string;
};
const entries: Omit<Game, "cover" | "source">[] = [
  {
    id: "chains-of-olympus",
    title: "God of War: Chains of Olympus",
    genres: ["Acción", "Aventura"],
    year: 2008,
    developer: "Ready at Dawn",
    description:
      "Kratos sirve a los dioses del Olimpo en una aventura anterior al primer God of War. Combate contra criaturas de la mitología griega y desciende al inframundo.",
  },
  {
    id: "vice-city-stories",
    title: "Grand Theft Auto: Vice City Stories",
    genres: ["Acción", "Aventura"],
    year: 2006,
    developer: "Rockstar Leeds / Rockstar North",
    description:
      "La historia de Victor Vance en Vice City, en 1984. Explora una ciudad abierta, completa misiones y construye tu imperio.",
  },
  {
    id: "freedom-unite",
    title: "Monster Hunter Freedom Unite",
    genres: ["Acción", "RPG"],
    year: 2008,
    developer: "Capcom",
    description:
      "Prepara tu equipo, acepta misiones y caza grandes monstruos. Una aventura de cacería con una extensa progresión de armas y armaduras.",
  },
  {
    id: "tekken-6",
    title: "Tekken 6",
    genres: ["Lucha"],
    year: 2009,
    developer: "Namco Bandai Games",
    description:
      "El Torneo del Rey del Puño de Hierro llega a PSP. Descubre su elenco de luchadores y domina los movimientos de cada estilo de combate.",
  },
  {
    id: "most-wanted",
    title: "Need for Speed: Most Wanted 5-1-0",
    genres: ["Carreras"],
    year: 2005,
    developer: "EA Canada",
    description:
      "La edición específica de Most Wanted para PSP combina carreras callejeras y persecuciones policiales.",
  },
  {
    id: "crisis-core",
    title: "Crisis Core: Final Fantasy VII",
    genres: ["Acción", "RPG"],
    year: 2007,
    developer: "Square Enix",
    description:
      "Sigue a Zack Fair, miembro de SOLDADO, en los acontecimientos que preceden a Final Fantasy VII.",
  },
  {
    id: "peace-walker",
    title: "Metal Gear Solid: Peace Walker",
    genres: ["Acción", "Aventura"],
    year: 2010,
    developer: "Kojima Productions",
    description:
      "Big Boss y los Militaires Sans Frontières se ven envueltos en un conflicto en Costa Rica. Infiltración, misiones y desarrollo de Mother Base.",
  },
  {
    id: "birth-by-sleep",
    title: "Kingdom Hearts: Birth by Sleep",
    genres: ["Acción", "RPG"],
    year: 2010,
    developer: "Square Enix",
    description:
      "Terra, Aqua y Ventus recorren mundos de Disney. Tres perspectivas conectadas exploran los orígenes de la saga Kingdom Hearts.",
  },
  {
    id: "daxter",
    title: "Daxter",
    genres: ["Plataformas", "Aventura"],
    year: 2006,
    developer: "Ready at Dawn",
    description:
      "Daxter trabaja como exterminador en Haven City mientras intenta encontrar a Jak. Una aventura de plataformas protagonizada por el ottsel.",
  },
  {
    id: "persona-3",
    title: "Persona 3 Portable",
    genres: ["RPG"],
    year: 2009,
    developer: "Atlus",
    description:
      "Alterna la vida escolar con la exploración de Tartarus. Crea vínculos y enfrenta las Sombras durante la Hora Oscura.",
  },
  {
    id: "tony-hawk",
    title: "Tony Hawk's Underground 2 Remix",
    genres: ["Deportes"],
    year: 2005,
    developer: "Shaba Games",
    description:
      "Lleva el World Destruction Tour a PSP con desafíos de skate y escenarios adicionales para esta edición portátil.",
  },
  {
    id: "ghost-of-sparta",
    title: "God of War: Ghost of Sparta",
    genres: ["Acción", "Aventura"],
    year: 2010,
    developer: "Ready at Dawn",
    description:
      "Kratos viaja en busca de respuestas sobre su familia y su pasado espartano. Una aventura situada después del primer God of War.",
  },
  {
    id: "liberty-city-stories",
    title: "Grand Theft Auto: Liberty City Stories",
    genres: ["Acción", "Aventura"],
    year: 2005,
    developer: "Rockstar Leeds / Rockstar North",
    description:
      "Toni Cipriani regresa a Liberty City en 1998. Recorre sus tres islas y descubre los conflictos de la familia Leone.",
  },
  {
    id: "gran-turismo",
    title: "Gran Turismo",
    genres: ["Carreras"],
    year: 2009,
    developer: "Polyphony Digital",
    description:
      "La conducción de Gran Turismo en PSP. Compite en circuitos, supera desafíos de conducción y amplía tu colección de coches.",
  },
  {
    id: "size-matters",
    title: "Ratchet & Clank: Size Matters",
    genres: ["Plataformas", "Acción"],
    year: 2007,
    developer: "High Impact Games",
    description:
      "Las vacaciones de Ratchet y Clank se convierten en una nueva aventura entre planetas, armas y dispositivos.",
  },
];
export const games: Game[] = entries.map((g) => ({
  ...g,
  cover: null,
  source: `https://en.wikipedia.org/wiki/${encodeURIComponent(g.title.replaceAll(" ", "_"))}`,
}));
export const featuredIds = [
  "crisis-core",
  "peace-walker",
  "birth-by-sleep",
  "daxter",
  "persona-3",
  "tony-hawk",
];
