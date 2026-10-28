import covers from "./wii-covers.json";
export type WiiGame = {
  id: string;
  title: string;
  genre: string;
  year: number;
  developer: string;
  description: string;
  cover: string | null;
  source: string | null;
  coverWidth: number;
  coverHeight: number;
};
const entries = [
  {
    id: "mario-galaxy",
    title: "Super Mario Galaxy",
    genre: "Plataformas",
    year: 2007,
    developer: "Nintendo EAD Tokyo",
    description:
      "Mario emprende un viaje por pequeñas galaxias para rescatar a la princesa Peach. Salta entre planetas y explora la gravedad de cada mundo.",
  },
  {
    id: "mario-kart",
    title: "Mario Kart Wii",
    genre: "Carreras",
    year: 2008,
    developer: "Nintendo EAD",
    description:
      "Mario y sus amigos compiten en circuitos del Reino Champiñón. Karts, motos, objetos y pistas clásicas se reúnen en esta edición para Wii.",
  },
  {
    id: "twilight-princess",
    title: "The Legend of Zelda: Twilight Princess",
    genre: "Aventura",
    year: 2006,
    developer: "Nintendo EAD",
    description:
      "Link y Midna se enfrentan a las sombras que cubren Hyrule. Explora mazmorras, resuelve acertijos y alterna entre las formas de héroe y lobo.",
  },
  {
    id: "wii-sports",
    title: "Wii Sports",
    genre: "Deportes",
    year: 2006,
    developer: "Nintendo EAD",
    description:
      "Tenis, béisbol, bolos, golf y boxeo se encuentran en esta colección de deportes diseñada para los controles de movimiento de Wii.",
  },
  {
    id: "smash-brawl",
    title: "Super Smash Bros. Brawl",
    genre: "Lucha",
    year: 2008,
    developer: "Sora / Game Arts",
    description:
      "Personajes de Nintendo y luchadores invitados se enfrentan en escenarios de sus universos. Incluye combates y la aventura del Emisario Subespacial.",
  },
  {
    id: "new-mario",
    title: "New Super Mario Bros. Wii",
    genre: "Plataformas",
    year: 2009,
    developer: "Nintendo EAD",
    description:
      "Mario, Luigi y los Toads recorren el Reino Champiñón en una aventura de plataformas lateral para hasta cuatro jugadores.",
  },
];
export const wiiGames: WiiGame[] = entries.map((g) => {
  const c = covers.find((c) => c.id === g.id);
  return {
    ...g,
    cover: c?.path || null,
    source: c?.source || null,
    coverWidth: c?.width || 250,
    coverHeight: c?.height || 354,
  };
});
