export const STROKES_PER_PLAYER = 2;

export type PlayerColor = {
  name: string;
  hex: string;
  hover: string;
  text: string;
};
export const PLAYER_COLORS: PlayerColor[] = [
  {
    name: "Red",
    hex: "#ff0000",
    hover: "#cc0000",
    text: "#ffffff",
  },
  {
    name: "Orange",
    hex: "#ff6600",
    hover: "#cc6600",
    text: "#ffffff",
  },
  {
    name: "Yellow",
    hex: "#ffcc00",
    hover: "#e6b800",
    text: "#000000",
  },
  {
    name: "Lime",
    hex: "#99ff33",
    hover: "#99cc00",
    text: "#000000",
  },
  {
    name: "Green",
    hex: "#00cc00",
    hover: "#009933",
    text: "#ffffff",
  },
  {
    name: "Teal",
    hex: "#009999",
    hover: "#006666",
    text: "#ffffff",
  },
  {
    name: "Cyan",
    hex: "#00ccff",
    hover: "#0099cc",
    text: "#000000",
  },
  {
    name: "Indigo",
    hex: "#0000ff",
    hover: "#0000cc",
    text: "#ffffff",
  },
  {
    name: "Purple",
    hex: "#6600cc",
    hover: "#4d0099",
    text: "#ffffff",
  },
  {
    name: "Magenta",
    hex: "#cc0099",
    hover: "#990073",
    text: "#ffffff",
  },
  {
    name: "Pink",
    hex: "#ff66ff",
    hover: "#ff1aff",
    text: "#000000",
  },
  {
    name: "Brown",
    hex: "#663300",
    hover: "#331a00",
    text: "#ffffff",
  },
];
