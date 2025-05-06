import { useEffect, useRef, useState } from "react";
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';

function MuzakPlayer() {
  const [musics, setMusics] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch("/api/listmuzak")
      .then((res) => res.json())
      .then((data) => {
        setMusics(data);
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentIndex(randomIndex);
        }
      })
      .catch((err) => console.error("Error fetching music list", err));
  }, []);

  useEffect(() => {
    if (audioRef.current && musics.length > 0 && hasInteracted) {
      audioRef.current.src = `/muzak/${musics[currentIndex]}`;
      audioRef.current.play().catch(console.error);
    }
  }, [currentIndex, musics, hasInteracted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume * 0.01;
    }
  }, [volume]);

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (!hasInteracted) {
      setHasInteracted(true); // First interaction unlocks autoplay
    }
  };

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % musics.length);
  };

  return (
    <>
      <audio ref={audioRef} onEnded={handleEnded} />
      <div>
        <RangeSlider
          style={{ width: '80px', height: '1px' }}
          id="volume"
          value={volume}
          onChange={(e) => handleVolumeChange(e.target.value)}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </>
  );
}

export default MuzakPlayer;
