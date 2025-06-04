import classNames from "classnames";
import { useState, type ReactNode } from "react";
import {
  IoMdArrowDropleftCircle,
  IoMdArrowDroprightCircle,
} from "react-icons/io";
import { MdOutlineTimer } from "react-icons/md";
import { FaArrowRotateRight, FaPaintbrush } from "react-icons/fa6";
import { SubjectCard } from "../PlayerArtboard";
import { FaCrown, FaDiceD20, FaGithub, FaLinkedin } from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";

interface InfoModalSlide {
  heading: string;
  content: ReactNode;
}

const CREDIT_LINKS: { icon: ReactNode; link: string; title: string }[] = [
  {
    icon: <FaGithub />,
    link: "https://github.com/daviddcarr",
    title: "David's Github Link",
  },
  {
    icon: <FaLinkedin />,
    link: "https://www.linkedin.com/in/david--dylan/",
    title: "David's LinkedIn Link",
  },
  {
    icon: <SiBuymeacoffee />,
    link: "https://buymeacoffee.com/davidcarr",
    title: "David's Buy me a coffee page",
  },
];

const MODAL_SLIDES: InfoModalSlide[] = [
  {
    heading: "The Basics",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-8">
        <div>
          <h1 className="text-5xl font-bold mb-0 text-white font-heading tracking-widest ">
            FITUMI
          </h1>
          <p className="text-sm text-purple-300 tracking-wide ">
            Fake It 'Til U Make It
          </p>
        </div>

        <p className="text-sm text-white max-w-md text-center">
          <span className="font-bold font-heading tracking-widest">FITUMI</span>{" "}
          is a deception game where all players are collaborating on a single
          piece of art, but one of you is unaware of the subject!
        </p>
      </div>
    ),
  },
  {
    heading: "The Artists",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-4">
        <FaPaintbrush className="text-4xl text-white" />
        <p className="text-sm text-white max-w-md text-center">
          Artists are the players that will be collaborating on the canvas. When
          in game they will be presented with a subject card.
        </p>
        <img
          className="max-w-sm rounded-xl w-full"
          src="/images/info-artboard.png"
        />
        <p className="text-sm text-white max-w-md text-center">
          The artists and the Faker will take turns adding a single mark to the
          canvas. By tapping/clicking and dragging on the white square you can
          draw a mark. Once you unclick/tap, your turn ends!
        </p>
        <p className="text-sm text-white max-w-md text-center">
          As an artist, it is your goal to sus out who doesn't know the subject,
          aka the Faker.
        </p>
      </div>
    ),
  },
  {
    heading: "The Faker",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-2">
        <SubjectCard subject={null} />

        <p className="text-sm text-white max-w-md text-center">
          Once a subject is chosen and the game begins, a player will be
          randomly chosen to be the Faker. Their goal will be to blend in with
          the Artists and attempt to contribute to the canvas without letting
          anyone know... that they don't know!
        </p>
      </div>
    ),
  },
  {
    heading: "Game Master",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-4">
        <FaCrown className="text-6xl text-white" />

        <p className="text-sm text-white max-w-md text-center">
          The Game Master (GM) is an optional role in{" "}
          <span className="font-bold font-heading tracking-widest">FITUMI</span>
          . The GM sets up the game for other players. Most importantly, they
          can set a custom subject for the Artists.
        </p>
        <img
          src="/images/info-gm-lobby.png"
          className="max-w-xs rounded-xl w-full"
        />
        <p className="text-sm text-white max-w-md text-center">
          If the GM is in play, their goal is to 'help' the Faker win by
          selecting a subject that will help them blend in with the Artists. If
          the Faker wins, the GM gets a point along with the Faker.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          To switch GMs, the current GM can click / tap any of the crown{" "}
          <FaCrown className="inline relative top-[-2px]" /> buttons to the
          right of the player's name in the player list. If there is no current
          GM, any player can click '
          <FaCrown className="inline relative top-[-2px]" /> Promote Me' to
          become the GM.
        </p>

        <img
          src="/images/info-gm-settings.png"
          className="max-w-xs rounded-xl w-full"
        />

        <p className="text-sm text-white max-w-md text-center">
          The GM has access to a settings menu to set up the game.
        </p>
        <p className="text-sm text-white max-w-md text-center">
          Clicking / tapping the subject button will open the subject menu. They
          can enter a custom subject and submit it here.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          Clicking / tapping the <FaDiceD20 className="inline" /> dice button
          will generate a random subject.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          Setting the{" "}
          <FaArrowRotateRight className="inline relative top-[-1px]" /> Stroke
          Count determines how many rounds of marks the players will be able to
          make before voting starts. 2 is generally the sweet spot, but chaos
          can happen with more or less.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          <MdOutlineTimer className="inline" /> Voting Time is the amount of
          seconds each player has to decide who they think is faking it once the
          round ends.
        </p>
      </div>
    ),
  },
  {
    heading: "Ending The Round",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-4">
        <p className="text-sm text-white max-w-md text-center">
          The game ends once each player has contributed a set number of
          marks/strokes to the canvas.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          The game will immediately begin the voting process, each participating
          player (non GM) will be given up to 15 seconds to decide who they
          believe was faking it.
        </p>

        <p className="text-sm text-white max-w-md text-center">
          If the Faker receives the most votes without a tie, the Artists win
          the round!
        </p>
        <p className="text-sm text-white max-w-md text-center">
          If the wrong player recieves the most votes, or a there is a tie, the
          Faker (and GM) win the round!
        </p>

        <img
          src="/images/info-voting.png"
          className="max-w-xs rounded-xl w-full"
        />
      </div>
    ),
  },
  {
    heading: "Credits",
    content: (
      <div className="w-full p-4 flex flex-col items-center gap-4">
        <p className="text-sm text-white max-w-md text-center">
          Thank you for playing!
        </p>
        <p className="text-sm text-white max-w-md text-center">
          <span className="font-bold font-heading tracking-widest">FITUMI</span>{" "}
          was created by{" "}
          <a
            href="https://www.daviddylancarr.com/"
            target="_blank"
            className="underline text-purple-300"
          >
            David Carr
          </a>
          .
        </p>
        <div className="flex gap-4">
          {CREDIT_LINKS.map((link) => (
            <a
              href={link.link}
              target="_blank"
              aria-label={link.title}
              className="w-8 h-8 rounded-full flex items-center justify-center text-3xl text-purple-300"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    ),
  },
];

const Info = () => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="max-h-[70vh] grid grid-rows-[auto_1fr_auto] overflow-y-scroll space-y-4">
      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-3xl text-purple-300 hover:text-purple-400 cursor-pointer"
          onClick={() =>
            setCurrentPage(
              currentPage > 0 ? currentPage - 1 : MODAL_SLIDES.length - 1
            )
          }
        >
          <IoMdArrowDropleftCircle />
        </button>
        <h2 className="text-2xl font-bold font-heading text-center text-white tracking-wider">
          {MODAL_SLIDES[currentPage].heading}
        </h2>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-3xl text-purple-300 hover:text-purple-400 cursor-pointer"
          onClick={() =>
            setCurrentPage((currentPage + 1) % MODAL_SLIDES.length)
          }
        >
          <IoMdArrowDroprightCircle />
        </button>
      </div>

      <div className="p-4 border-2 overflow-scroll border-purple-700 bg-purple-800 rounded-3xl">
        {MODAL_SLIDES[currentPage].content}
      </div>

      <div className="flex justify-center gap-2">
        {MODAL_SLIDES.map((_, i) => (
          <button
            key={i}
            className="text-sm text-white hover:underline"
            onClick={() => setCurrentPage(i)}
          >
            <div
              className={classNames(
                "w-3 h-3 rounded-full flex items-center justify-center",
                currentPage === i
                  ? "bg-white"
                  : "bg-purple-300 hover:bg-purple-400 cursor-pointer"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Info;
