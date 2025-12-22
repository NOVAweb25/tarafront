import { useRef, useState, useEffect } from "react";
import { Music, Music2 } from "lucide-react";
import { useLocation } from "react-router-dom";


const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.3; // صوت هادئ
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
const location = useLocation();

const blockedRoutes = [
  "/checkout",
  "/payment-success",
  "/payment-failed"
];

if (blockedRoutes.includes(location.pathname)) {
  return null;
}

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/audio/ambient.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          background: "#6b7f4f",
          borderRadius: "50%",
          padding: "12px",
          border: "none",
          cursor: "pointer",
          color: "#fff",
        }}
        aria-label="تشغيل أو إيقاف الموسيقى"
      >
        {isPlaying ? <Music2 size={22} /> : <Music size={22} />}
      </button>
    </>
  );
};

export default BackgroundMusic;
