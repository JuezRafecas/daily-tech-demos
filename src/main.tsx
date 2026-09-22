import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

type Scene = 'base' | 'environment' | 'light' | 'colorway' | 'fullLook';
type Playback = 'loading' | 'ready' | 'starting' | 'playing' | 'error';
type Direction = 'forward' | 'reverse';

interface VideoConfig {
  forward: string;
  reverse: string;
  holdTime?: number;
}

const VIDEO_CONFIGS: Record<Exclude<Scene, 'base'>, VideoConfig> = {
  colorway: {
    forward: '/retake/video-1.mp4',
    reverse: '/retake/video-1-reverse.mp4',
  },
  environment: {
    forward: '/retake/video-2.mp4',
    reverse: '/retake/video-2-reverse.mp4',
    holdTime: 0.18,
  },
  light: {
    forward: '/retake/video-3.mp4',
    reverse: '/retake/video-3-reverse.mp4',
  },
  fullLook: {
    forward: '/retake/video-4.mp4',
    reverse: '/retake/video-4-reverse.mp4',
  },
};

const SCENE_LABELS: Record<Exclude<Scene, 'base'>, string> = {
  environment: 'Scene',
  light: 'Lighting',
  colorway: 'Clothing',
  fullLook: 'Cast',
};

function App() {
  const [scene, setScene] = useState<Scene>('base');
  const [playback, setPlayback] = useState<Playback>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<Scene | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidingRear, setIsHidingRear] = useState(false);
  const [isHidingTitle, setIsHidingTitle] = useState(false);
  const [capsuleText, setCapsuleText] = useState('Select state →');

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const transitionToken = useRef(0);
  const playbackLock = useRef(false);
  const currentVideo = useRef<HTMLVideoElement | null>(null);
  const frameCallbackId = useRef<number | null>(null);

  useEffect(() => {
    const videos = Object.entries(VIDEO_CONFIGS).flatMap(([_, config]) => [
      config.forward,
      config.reverse,
    ]);

    let readyCount = 0;
    const handleReady = () => {
      readyCount++;
      if (readyCount === videos.length) {
        setPlayback('ready');
      }
    };

    videos.forEach((src) => {
      const video = videoRefs.current[src];
      if (video) {
        if (video.readyState >= 2) {
          handleReady();
        } else {
          video.addEventListener('loadeddata', handleReady, { once: true });
        }
      }
    });

    return () => {
      if (frameCallbackId.current !== null) {
        cancelAnimationFrame(frameCallbackId.current);
      }
    };
  }, []);

  const getCapsuleStyle = () => {
    if (isCollapsed) {
      return {
        left: '50%',
        width: '200px',
        transform: 'translateX(-50%)',
      };
    }

    const buttons: Array<Exclude<Scene, 'base'>> = ['environment', 'light', 'colorway', 'fullLook'];
    const hovered = hoveredButton && hoveredButton !== 'base' ? hoveredButton : null;
    
    if (!hovered) {
      return {
        left: '-5px',
        width: 'calc(20% + 5px)',
      };
    }

    const index = buttons.indexOf(hovered as Exclude<Scene, 'base'>);
    const position = (index + 1) * 20;

    if (index === 3) {
      return {
        left: '80%',
        width: 'calc(20% + 5px)',
      };
    }

    return {
      left: `${position}%`,
      width: '20%',
    };
  };

  const playTransition = async (targetScene: Exclude<Scene, 'base'>, direction: Direction) => {
    if (playbackLock.current) return;

    const token = ++transitionToken.current;
    playbackLock.current = true;
    setIsPlaying(true);

    const config = VIDEO_CONFIGS[targetScene];
    const videoSrc = direction === 'forward' ? config.forward : config.reverse;
    const video = videoRefs.current[videoSrc];

    if (!video) {
      playbackLock.current = false;
      setIsPlaying(false);
      return;
    }

    if (direction === 'forward') {
      setIsCollapsed(true);
      setCapsuleText(SCENE_LABELS[targetScene]);
      
      setTimeout(() => {
        if (token !== transitionToken.current) return;
        setIsHidingRear(true);
      }, 650);

      setTimeout(() => {
        if (token !== transitionToken.current) return;
        setIsHidingTitle(true);
      }, 200);
    } else {
      setIsHidingRear(false);
      setCapsuleText('');
      setTimeout(() => {
        if (token !== transitionToken.current) return;
        setIsCollapsed(false);
      }, 50);
    }

    try {
      video.currentTime = 0;
      await video.play();

      const waitForFrame = () => {
        return new Promise<void>((resolve) => {
          if ('requestVideoFrameCallback' in video) {
            (video as any).requestVideoFrameCallback(() => resolve());
          } else {
            requestAnimationFrame(() => resolve());
          }
        });
      };

      await waitForFrame();

      if (token !== transitionToken.current) {
        video.pause();
        return;
      }

      if (currentVideo.current && currentVideo.current !== video) {
        currentVideo.current.classList.add('hidden');
      }
      
      video.classList.remove('hidden');
      currentVideo.current = video;

      const holdTime = config.holdTime !== undefined ? config.holdTime : 0.08;
      const targetTime = video.duration - holdTime;

      const checkProgress = () => {
        if (token !== transitionToken.current || !video) return;

        if (video.currentTime >= targetTime || video.ended) {
          video.pause();
          
          if (direction === 'forward') {
            setScene(targetScene);
            setTimeout(() => {
              if (token !== transitionToken.current) return;
              setCapsuleText('Reset');
            }, 100);
          } else {
            setScene('base');
            setIsHidingTitle(false);
          }

          playbackLock.current = false;
          setIsPlaying(false);
        } else {
          frameCallbackId.current = requestAnimationFrame(checkProgress);
        }
      };

      frameCallbackId.current = requestAnimationFrame(checkProgress);
    } catch (error) {
      console.error('Playback error:', error);
      playbackLock.current = false;
      setIsPlaying(false);
      setPlayback('error');
    }
  };

  const handleButtonClick = async (targetScene: Exclude<Scene, 'base'>) => {
    if (playbackLock.current || scene !== 'base') return;
    await playTransition(targetScene, 'forward');
  };

  const handleReset = async () => {
    if (playbackLock.current || scene === 'base') return;
    await playTransition(scene as Exclude<Scene, 'base'>, 'reverse');
  };

  const buttons: Array<Exclude<Scene, 'base'>> = ['environment', 'light', 'colorway', 'fullLook'];

  return (
    <div className="scene-container">
      <img 
        src="/retake/state-base.png" 
        alt="" 
        className="scene-media"
        aria-hidden="true"
      />
      
      {Object.entries(VIDEO_CONFIGS).map(([sceneKey, config]) => (
        <React.Fragment key={sceneKey}>
          <video
            ref={(el) => (videoRefs.current[config.forward] = el)}
            src={config.forward}
            className="scene-media hidden"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <video
            ref={(el) => (videoRefs.current[config.reverse] = el)}
            src={config.reverse}
            className="scene-media hidden"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </React.Fragment>
      ))}

      <header className="header">
        <a href="/" aria-label="LTX home">
          <img src="/ltx-studio-logo.svg" alt="LTX" className="header-logo" />
        </a>
        <div className="header-metadata">
          <div className="header-text">LTX-2.5 is here</div>
          <div className="header-text">Smarter. Faster</div>
        </div>
        <a 
          href="https://app.ltx.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="header-cta"
        >
          Try now
        </a>
      </header>

      <div className="hero-copy">
        <h1 className={`hero-heading ${isHidingTitle ? 'hiding' : ''}`}>
          <span className="word-1">The </span>
          <span className="word-2">world </span>
          <span className="word-3">model</span>
        </h1>
        <p className="hero-description">
          LTX builds open world models that give you full control, from production-grade video to systems that understand and operate in the physical world.
        </p>
      </div>

      <div className={`controller-wrapper ${isCollapsed ? 'collapsed' : ''} ${isHidingRear ? 'hiding-rear' : ''}`}>
        <div className="controller-rear" />
        
        <div className="controller-capsule" style={getCapsuleStyle()}>
          {scene !== 'base' ? (
            <button 
              className="controller-capsule-text reset"
              onClick={handleReset}
              disabled={isPlaying}
            >
              {capsuleText}
            </button>
          ) : (
            <span className="controller-capsule-text">
              {capsuleText}
            </span>
          )}
        </div>

        <div className="controller-grid">
          <div className={`controller-label ${hoveredButton ? 'dimmed' : ''}`}>
            Select state →
          </div>
          
          {buttons.map((btn) => (
            <button
              key={btn}
              className={`controller-button ${isCollapsed ? 'hiding' : ''}`}
              onClick={() => handleButtonClick(btn)}
              onMouseEnter={() => !isCollapsed && setHoveredButton(btn)}
              onMouseLeave={() => !isCollapsed && setHoveredButton(null)}
              onFocus={() => !isCollapsed && setHoveredButton(btn)}
              onBlur={() => !isCollapsed && setHoveredButton(null)}
              disabled={scene !== 'base' || isPlaying}
            >
              {SCENE_LABELS[btn]}
            </button>
          ))}
        </div>
      </div>

      <footer className="footer">
        <p>
          <a href="https://github.com/amirmushichge/video-states-website" target="_blank" rel="noopener noreferrer">
            Video States by Amir Mušić
          </a>
          {' · '}
          <a href="https://x.com/AmirMushich/status/2097673877539238021" target="_blank" rel="noopener noreferrer">
            X Bookmark
          </a>
        </p>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
