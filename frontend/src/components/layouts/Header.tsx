import { useEffect, useState } from "react";

type HeaderProps = {
  text?: string;
  speed?: number; // Speed of the writing effect
};

const Header = ({ text = "LINKED", speed = 100 }: HeaderProps) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <h1 className="text-5xl font-bold text-yellow-400 text-center" style={{ fontFamily: '"Playwrite HU", sans-serif' }}>
      {displayText}

    </h1>
  );
};

export default Header;
