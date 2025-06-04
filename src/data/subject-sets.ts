import type { PreviousArt } from "../lib/interfaces/room-state";

export const BASIC_SUBJECTS: string[] = [
  // Animals
  "cat",
  "bat",
  "bear",
  "bee",
  "butterfly",
  "cobra",
  "dog",
  "dolphin",
  "fish",
  "fox",
  "frog",
  "elephant",
  "giraffe",
  "kangaroo",
  "lion",
  "lizard",
  "owl",
  "panda",
  "penguin",
  "rabbit",
  "snail",
  "snake",
  "spider",
  "squirrel",
  "turtle",
  "tiger",
  "viper",
  "zebra",

  // Foods
  "apple",
  "banana",
  "burger",
  "cake",
  "candy",
  "carrot",
  "cookie",
  "cupcake",
  "donut",
  "pineapple",
  "pizza",
  "popcorn",
  "sandwich",
  "sushi",
  "taco",

  // Vehicles
  "air balloon",
  "airplane",
  "bicycle",
  "blimp",
  "car",
  "boat",
  "bus",
  "helicopter",
  "school bus",
  "ship",
  "ski lift",
  "submarine",
  "subway",
  "train",

  // Nature
  "cloud",
  "flower",
  "hurricane",
  "mountain",
  "palm tree",
  "river",
  "snowflake",
  "tornado",
  "tree",
  "waterfall",
  "volcano",

  // Buildings / Infrastructure
  "big ben",
  "brick wall",
  "bridge",
  "castle",
  "eiffel tower",
  "house",
  "leaning tower",
  "lighthouse",
  "pyramid",
  "skyscraper",

  // Space
  "alien",
  "earth",
  "galaxy",
  "moon",
  "planet",
  "rocket",
  "saturn",
  "star",
  "sun",

  // Objects
  "balloon",
  "book",
  "camera",
  "clock",
  "chair",
  "computer",
  "crayon",
  "guitar",
  "hat",
  "key",
  "lamp",
  "letter",
  "paintbrush",
  "pencil",
  "phone",
  "scissors",
  "sword",
  "television",
  "toothbrush",
  "umbrella",

  // Fantasy
  "centaur",
  "cyclops",
  "dragon",
  "fairy",
  "ghost",
  "gnome",
  "hippogryph",
  "mermaid",
  "unicorn",
  "vampire",
  "wizard",
];

export const getRandomSubject = (previousArt: PreviousArt[]) => {
  // Unused Subjects
  let unusedSubjects: string[];
  if (previousArt.length > 0) {
    unusedSubjects = BASIC_SUBJECTS.filter(
      (subject) => !previousArt.some((art) => art.subject === subject)
    );
  } else {
    unusedSubjects = BASIC_SUBJECTS;
  }

  // Set Subject or Grab Random Subject if no game master
  return unusedSubjects[Math.floor(Math.random() * unusedSubjects.length)];
};
