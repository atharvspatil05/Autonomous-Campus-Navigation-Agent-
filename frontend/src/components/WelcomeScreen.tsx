import { useEffect, useState, useCallback, useRef } from 'react'

interface WelcomeScreenProps {
  onEnter: () => void
}

type Language = 'en' | 'mr'

interface SlideInfo {
  image: string
  step: { en: string; mr: string }
  shortTitle: { en: string; mr: string }
  label: { en: string; mr: string }
  caption: { en: string; mr: string }
  description: { en: string; mr: string }
  kenBurns: string
}

const SLIDES: SlideInfo[] = [
  {
    image: '/sanjivani_gate_real.png',
    step: { en: '01', mr: '०१' },
    shortTitle: { en: 'Main Gate', mr: 'मुख्य गेट' },
    label: { en: 'Main Entrance Gate', mr: 'मुख्य प्रवेशद्वार' },
    caption: { en: 'Sanjivani Group of Institutes', mr: 'संजीवनी ग्रुप ऑफ इन्स्टिट्यूट्स' },
    description: {
      en: 'The iconic landmark gateway to the Kopargaon campus, welcoming students and faculty with modern security and greenery.',
      mr: 'कोपरगाव कॅम्पसचे मुख्य भव्य प्रवेशद्वार, जे सर्व विद्यार्थी, प्राध्यापक आणि पाहुण्यांचे सहर्ष स्वागत करते.',
    },
    kenBurns: 'kenburns-zoom-in',
  },
  {
    image: '/sanjivani_campus_overview.png',
    step: { en: '02', mr: '०२' },
    shortTitle: { en: 'Driveway', mr: 'कॅम्पस रस्ता' },
    label: { en: 'Campus Driveway & Buildings', mr: 'कॅम्पस मार्ग व इमारती' },
    caption: { en: 'Connecting Gate to Academic Complex', mr: 'प्रवेशद्वार ते शैक्षणिक संकुल' },
    description: {
      en: 'Wide roadway leading past the central roundabout toward the Sanjivani K.B.P. Polytechnic and Engineering complexes.',
      mr: 'हिरवेगार वृक्ष आणि मध्यवर्ती चौक ओलांडून अभियांत्रिकी व तंत्रनिकेतन संकुलाकडे जाणारा प्रशस्त रस्ता.',
    },
    kenBurns: 'kenburns-pan-right',
  },
  {
    image: '/sanjivani_amphitheater.jpg',
    step: { en: '03', mr: '०३' },
    shortTitle: { en: 'Amphitheater', mr: 'ॲम्फीथिएटर' },
    label: { en: 'Open-Air Amphitheater', mr: 'ओपन-एअर ॲम्फीथिएटर' },
    caption: { en: 'Student Life & Cultural Heart', mr: 'विद्यार्थी जीवन आणि सांस्कृतिक केंद्र' },
    description: {
      en: 'Tiered green amphitheater lawns surrounded by modern engineering wings and dynamic student life.',
      mr: 'अभियांत्रिकी विभागांच्या इमारतींनी वेढलेली पायऱ्यांची हिरवळ आणि सांस्कृतिक कार्यक्रमांची मोकळी जागा.',
    },
    kenBurns: 'kenburns-zoom-out',
  },
]

const STATS_DATA = {
  en: [
    { value: '25+', label: 'Landmarks' },
    { value: '100%', label: 'Campus Coverage' },
    { value: 'Live', label: 'Smart Navigation' },
  ],
  mr: [
    { value: '२५+', label: 'महत्त्वाची ठिकाणे' },
    { value: '१००%', label: 'कॅम्पस कव्हरेज' },
    { value: 'थेट', label: 'स्मार्ट नेव्हिगेशन' },
  ],
}

const TEXT = {
  en: {
    collegeName: 'Sanjivani College of Engineering',
    location: 'Kopargaon, Maharashtra',
    grade: "NAAC 'A' Grade",
    autonomous: 'Autonomous',
    badge: 'Autonomous Campus Navigation',
    greeting: 'Welcome to Sanjivani Campus',
    titleMain: 'Explore Sanjivani Campus',
    titleSub: 'In Real Time',
    description:
      'Discover academic departments, laboratories, and student facilities from the Main Gate with effortless natural directions.',
    cta: 'Enter Interactive Map',
    pause: 'Pause',
    resume: 'Resume',
  },
  mr: {
    collegeName: 'संजीवनी अभियांत्रिकी महाविद्यालय',
    location: 'कोपरगाव, महाराष्ट्र',
    grade: "नॅक 'अ' दर्जा",
    autonomous: 'स्वायत्त संस्था',
    badge: 'स्वायत्त कॅम्पस नेव्हिगेशन',
    greeting: 'संजीवनी कॅम्पसमध्ये आपले सहर्ष स्वागत आहे',
    titleMain: 'संजीवनी कॅम्पस एक्सप्लोर करा',
    titleSub: 'थेट अचूक मार्गदर्शनासह',
    description:
      'मुख्य प्रवेशद्वारापासून विविध विभाग, प्रयोगशाळा आणि संकुलापर्यंत अचूक आणि सुलभ दिशादर्शनाचा अनुभव घ्या.',
    cta: 'परस्परसंवादी नकाशा सुरू करा',
    pause: 'थांबवा',
    resume: 'सुरू करा',
  },
}

const SLIDE_DURATION = 6000

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [lang, setLang] = useState<Language>('en')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [entered, setEntered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const progressRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  // Reveal content
  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 200)
    return () => clearTimeout(t)
  }, [])

  const goToSlide = useCallback((idx: number) => {
    if (transitioning || idx === currentSlide) return
    setTransitioning(true)
    setPrevSlide(currentSlide)
    setCurrentSlide(idx)
    setProgress(0)
    startTimeRef.current = Date.now()
    setTimeout(() => {
      setPrevSlide(null)
      setTransitioning(false)
    }, 750)
  }, [transitioning, currentSlide])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % SLIDES.length)
  }, [currentSlide, goToSlide])

  const prevSlideAction = useCallback(() => {
    goToSlide((currentSlide - 1 + SLIDES.length) % SLIDES.length)
  }, [currentSlide, goToSlide])

  // Progress bar animation & auto-advance
  useEffect(() => {
    if (isPaused || entered) return

    startTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        nextSlide()
      } else {
        progressRef.current = requestAnimationFrame(tick)
      }
    }

    progressRef.current = requestAnimationFrame(tick)
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [currentSlide, isPaused, entered, nextSlide, progress])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (entered) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlideAction()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleEnter()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlideAction, entered])

  const handleEnter = () => {
    setEntered(true)
    setTimeout(onEnter, 600)
  }

  const safeSlideIndex = currentSlide >= SLIDES.length ? 0 : currentSlide
  const activeSlide = SLIDES[safeSlideIndex] || SLIDES[0]
  const t = TEXT[lang]
  const stats = STATS_DATA[lang]

  useEffect(() => {
    if (currentSlide >= SLIDES.length) {
      setCurrentSlide(0)
    }
  }, [currentSlide])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        opacity: entered ? 0 : 1,
        transform: entered ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: entered ? 'none' : 'auto',
        fontFamily: "'Inter', 'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif",
        background: '#04060c',
        color: '#fff',
      }}
    >
      {/* ── Background Slides ─────────────────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 48%',
            opacity: i === safeSlideIndex ? 1 : i === prevSlide ? 0 : 0,
            transition: 'opacity 0.85s cubic-bezier(0.4,0,0.2,1)',
            filter: 'brightness(0.9) contrast(1.04)',
            willChange: 'transform, opacity',
          }}
          className={i === safeSlideIndex ? slide.kenBurns : ''}
        />
      ))}

      {/* ── Cinematic Dark Overlays ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 95% 65% at 50% 45%, rgba(4,6,14,0.2) 0%, rgba(4,6,14,0.78) 90%),
            linear-gradient(to bottom,
              rgba(4, 6, 14, 0.75) 0%,
              rgba(4, 6, 14, 0.2) 22%,
              rgba(4, 6, 14, 0.28) 60%,
              rgba(4, 6, 14, 0.94) 100%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* ── Top Header ────────────────────────────────────────── */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Left: Logo & College details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src="/sanjivani_logo.png"
              alt="Sanjivani Group of Institutes"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: lang === 'mr' ? '0.02em' : '0.06em',
                textTransform: 'uppercase',
                color: '#fff',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              }}
            >
              {t.collegeName}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.75)',
                marginTop: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 500,
              }}
            >
              <span>{t.location}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>{t.grade}</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#38bdf8' }}>{t.autonomous}</span>
            </div>
          </div>
        </div>

        {/* Right: Language Switcher & Play/Pause */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Marathi / English Switcher */}
          <div className="language-toggle">
            <button
              onClick={() => setLang('en')}
              className={`lang-option ${lang === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('mr')}
              className={`lang-option ${lang === 'mr' ? 'active' : ''}`}
            >
              मराठी
            </button>
          </div>

          {/* Quick Play/Pause */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="welcome-pill-btn"
            title={isPaused ? 'Resume auto tour' : 'Pause tour'}
          >
            {isPaused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
            <span>{isPaused ? t.resume : t.pause}</span>
          </button>
        </div>
      </header>

      {/* ── Main Centerpiece Hero ─────────────────────────────── */}
      <main
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 24px',
          zIndex: 15,
        }}
      >
        {/* Marathi Cultural Greeting Banner */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#fbbf24',
            letterSpacing: '0.04em',
            marginBottom: '10px',
            textShadow: '0 2px 14px rgba(0,0,0,0.8)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {t.greeting}
        </div>

        {/* Clean Modern Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '9999px',
            padding: '6px 18px',
            marginBottom: '18px',
            backdropFilter: 'blur(12px)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#e0e7ff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {t.badge}
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(34px, 5.8vw, 74px)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.75)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #ffffff 15%, #c4b5fd 55%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t.titleMain}
          </span>
          <br />
          <span>{t.titleSub}</span>
        </h1>

        {/* Simple Subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '640px',
            lineHeight: 1.6,
            margin: '0 0 34px',
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.65s ease 0.3s, transform 0.65s ease 0.3s',
          }}
        >
          {t.description}
        </p>

        {/* Modernized, Highly Clickable Enter Map Button */}
        <div
          style={{
            marginBottom: '38px',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.65s ease 0.4s, transform 0.65s ease 0.4s',
          }}
        >
          <button
            onClick={handleEnter}
            className="enter-map-btn"
            id="explore-campus-cta"
          >
            <span className="enter-map-text">{t.cta}</span>
            <span className="enter-map-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>

        {/* Clean, Attractive Stats */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(16px, 3.5vw, 44px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '12px 32px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.65s ease 0.5s, transform 0.65s ease 0.5s',
          }}
        >
          {stats.map((s, idx) => (
            <div key={idx} style={{ textAlign: 'center', minWidth: '75px' }}>
              <div
                style={{
                  fontSize: 'clamp(19px, 2.2vw, 26px)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  marginTop: '4px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Bottom Tour Controls & Interactive Card ──────────── */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          zIndex: 20,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s',
          background: 'linear-gradient(to top, rgba(4,6,14,0.92) 0%, transparent 100%)',
        }}
      >
        {/* Interactive Bottom-Left Card with Clickable Location Tabs */}
        <div className="interactive-location-card">
          {/* Top Tabs: Click any location */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.step.en}
                onClick={() => goToSlide(idx)}
                className={`location-tab-btn ${idx === safeSlideIndex ? 'active' : ''}`}
              >
                <span>{slide.step[lang]}</span>
                <span>{slide.shortTitle[lang]}</span>
              </button>
            ))}
          </div>

          {/* Location Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}
            >
              {activeSlide.label[lang]}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                fontWeight: 600,
              }}
            >
              {activeSlide.caption[lang]}
            </span>
          </div>

          {/* Location Description */}
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.5,
              marginBottom: '12px',
            }}
          >
            {activeSlide.description[lang]}
          </div>

          {/* Animated Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '3px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                transition: isPaused ? 'none' : 'width 0.1s linear',
              }}
            />
          </div>
        </div>

        {/* Right: Quick Arrow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={prevSlideAction}
            className="tour-arrow-btn"
            title="Previous location"
            aria-label="Previous location"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="tour-arrow-btn"
            title="Next location"
            aria-label="Next location"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </footer>

      {/* ── Styles ────────────────────────────────────────────── */}
      <style>{`
        /* Ken Burns animations */
        @keyframes kb-zoom-in {
          0%   { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1%, -1.5%); }
        }
        @keyframes kb-zoom-out {
          0%   { transform: scale(1.14) translate(1%, 1%); }
          100% { transform: scale(1.01) translate(0, 0); }
        }
        @keyframes kb-pan-right {
          0%   { transform: scale(1.08) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2.5%, -1%); }
        }
        @keyframes kb-pan-left {
          0%   { transform: scale(1.08) translate(0, 0); }
          100% { transform: scale(1.1) translate(2.5%, 1%); }
        }

        .kenburns-zoom-in  { animation: kb-zoom-in  6.5s ease-in-out forwards; }
        .kenburns-zoom-out { animation: kb-zoom-out 6.5s ease-in-out forwards; }
        .kenburns-pan-right { animation: kb-pan-right 6.5s ease-in-out forwards; }
        .kenburns-pan-left  { animation: kb-pan-left  6.5s ease-in-out forwards; }

        /* Modernized Enter Map CTA Button */
        .enter-map-btn {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 18px 44px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 45%, #06b6d4 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 9999px;
          color: #ffffff;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 14px 40px rgba(79, 70, 229, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .enter-map-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .enter-map-btn:hover {
          transform: translateY(-3px) scale(1.025);
          box-shadow: 0 20px 50px rgba(79, 70, 229, 0.65), 0 0 0 4px rgba(99, 102, 241, 0.28);
        }

        .enter-map-btn:hover::before {
          transform: translateX(100%);
        }

        .enter-map-btn:active {
          transform: translateY(-1px) scale(0.99);
        }

        .enter-map-text {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .enter-map-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .enter-map-btn:hover .enter-map-arrow {
          transform: translateX(4px);
          background: rgba(255, 255, 255, 0.3);
        }

        /* Language Toggle in Header */
        .language-toggle {
          display: inline-flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          padding: 3px;
          backdrop-filter: blur(12px);
        }

        .lang-option {
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.65);
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .lang-option:hover {
          color: #fff;
        }

        .lang-option.active {
          background: linear-gradient(135deg, #6366f1, #38bdf8);
          color: #fff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }

        /* Top Pill Button */
        .welcome-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .welcome-pill-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: translateY(-1px);
        }

        /* Interactive Bottom Left Location Card */
        .interactive-location-card {
          width: 100%;
          max-width: 520px;
          background: rgba(10, 15, 30, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 18px;
          padding: 16px 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .interactive-location-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.15);
        }

        /* Location Tabs inside card */
        .location-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.65);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .location-tab-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .location-tab-btn.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(56, 189, 248, 0.25));
          border-color: rgba(99, 102, 241, 0.6);
          color: #fff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
        }

        .location-tab-btn.active span:first-child {
          color: #38bdf8;
        }

        /* Tour Arrow Button */
        .tour-arrow-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(10, 15, 30, 0.75);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(14px);
          transition: all 0.2s ease;
        }

        .tour-arrow-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.35);
          transform: scale(1.08);
        }
      `}</style>
    </div>
  )
}
