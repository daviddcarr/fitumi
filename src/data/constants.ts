export const STROKES_PER_PLAYER = 2;

export type PlayerColor = {
  name: string;
  hex: string;
  hover: string;
  text: string;
  bg: string;
  hoverBg: string;
  border: string;
  hoverBorder: string;
};
export const PLAYER_COLORS: PlayerColor[] = [
  {
    name: "Red",
    hex: "#ff0000",
    hover: "#cc0000",
    text: "text-white",
    bg: "bg-red",
    hoverBg: "hover:bg-red-hover",
    border: "border-red",
    hoverBorder: "hover:border-red-hover",
  },
  {
    name: "Orange",
    hex: "#ff6600",
    hover: "#cc6600",
    text: "text-white",
    bg: "bg-orange",
    hoverBg: "hover:bg-orange-hover",
    border: "border-orange",
    hoverBorder: "hover:border-orange-hover",
  },
  {
    name: "Yellow",
    hex: "#ffcc00",
    hover: "#e6b800",
    text: "text-black",
    bg: "bg-yellow",
    hoverBg: "hover:bg-yellow-hover",
    border: "border-yellow",
    hoverBorder: "hover:border-yellow-hover",
  },
  {
    name: "Lime",
    hex: "#99ff33",
    hover: "#99cc00",
    text: "text-black",
    bg: "bg-lime",
    hoverBg: "hover:bg-lime-hover",
    border: "border-lime",
    hoverBorder: "hover:border-lime-hover",
  },
  {
    name: "Green",
    hex: "#00cc00",
    hover: "#009933",
    text: "text-white",
    bg: "bg-green",
    hoverBg: "hover:bg-green-hover",
    border: "border-green",
    hoverBorder: "hover:border-green-hover",
  },
  {
    name: "Teal",
    hex: "#009999",
    hover: "#006666",
    text: "text-white",
    bg: "bg-teal",
    hoverBg: "hover:bg-teal-hover",
    border: "border-teal",
    hoverBorder: "hover:border-teal-hover",
  },
  {
    name: "Cyan",
    hex: "#00ccff",
    hover: "#0099cc",
    text: "text-black",
    bg: "bg-cyan",
    hoverBg: "hover:bg-cyan-hover",
    border: "border-cyan",
    hoverBorder: "hover:border-cyan-hover",
  },
  {
    name: "Indigo",
    hex: "#0000ff",
    hover: "#0000cc",
    text: "text-white",
    bg: "bg-indigo",
    hoverBg: "hover:bg-indigo-hover",
    border: "border-indigo",
    hoverBorder: "hover:border-indigo-hover",
  },
  {
    name: "Purple",
    hex: "#6600cc",
    hover: "#4d0099",
    text: "text-white",
    bg: "bg-purple",
    hoverBg: "hover:bg-purple-hover",
    border: "border-purple",
    hoverBorder: "hover:border-purple-hover",
  },
  {
    name: "Magenta",
    hex: "#cc0099",
    hover: "#990073",
    text: "text-white",
    bg: "bg-magenta",
    hoverBg: "hover:bg-magenta-hover",
    border: "border-magenta",
    hoverBorder: "hover:border-magenta-hover",
  },
  {
    name: "Pink",
    hex: "#ff66ff",
    hover: "#ff1aff",
    text: "text-black",
    bg: "bg-pink",
    hoverBg: "hover:bg-pink-hover",
    border: "border-pink",
    hoverBorder: "hover:border-pink-hover",
  },
  {
    name: "Brown",
    hex: "#663300",
    hover: "#331a00",
    text: "text-white",
    bg: "bg-brown",
    hoverBg: "hover:bg-brown-hover",
    border: "border-brown",
    hoverBorder: "hover:border-brown-hover",
  },
];

export const getColor = (name: string): PlayerColor => {
  return PLAYER_COLORS.find((c) => c.name === name) as PlayerColor;
};