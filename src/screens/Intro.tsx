import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '../components/Button/Button';
import { IconButton } from '../components/IconButton/IconButton';
import { Logo } from '../components/Logo/Logo';
import { PageDots } from '../components/PageDots/PageDots';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { navigate } from '../app/router';
import { SLIDES } from './slides';
import s from './Screen.module.css';
import styles from './Intro.module.css';

const SWIPE_PX = 50;

/** Figma "↳ Slider": three intro slides. Swipe, arrow keys or the round buttons move between them. */
export function Intro({ index }: { index: number }) {
  const slide = SLIDES[index];
  const last = SLIDES.length - 1;
  const startX = useRef<number | null>(null);

  const go = (i: number) => {
    if (i >= 0 && i <= last) navigate(`/intro/${i + 1}`, { replace: true });
  };
  const start = () => navigate('/auth/login');

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (dx < -SWIPE_PX) go(index + 1);
    else if (dx > SWIPE_PX) go(index - 1);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <div className={s.screen} onKeyDown={onKeyDown}>
      <ScreenBackground variant={slide.background} />
      <div className={s.body}>
        <header className={styles.header}>
          <Logo variant="short" height={48} />
          <Button variant="outlined" size="medium" className={styles.skip} onClick={start}>
            Skip
          </Button>
        </header>

        <section
          className={styles.slide}
          aria-roledescription="carousel"
          aria-label="Introduction"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (startX.current = null)}
        >
          <div className={styles.collage} key={index} aria-hidden="true">
            {(['backLeft', 'backRight', 'front'] as const).map((pos, i) => (
              <figure key={pos} className={`${styles.card} ${styles[pos]}`}>
                {slide.photos[i] ? <img src={slide.photos[i]} alt="" className={styles.photo} draggable={false} /> : <span className={styles.placeholder} />}
              </figure>
            ))}
          </div>

          <div className={styles.bottom}>
            <div className={styles.copy} key={index} aria-roledescription="slide" aria-label={`${index + 1} of ${SLIDES.length}`}>
              <h1 className={`text-h2 ${s.h2}`}>{slide.title}</h1>
              <p className={`text-body-md-regular ${s.lead}`}>{slide.body}</p>
              <PageDots count={SLIDES.length} active={index} />
            </div>

            <nav className={styles.nav} aria-label="Slides">
              {index > 0 && <IconButton icon={<CaretLeft />} aria-label="Previous slide" variant="solid" color="secondary" size="large" onClick={() => go(index - 1)} />}
              <Button size="large" className={styles.cta} onClick={start}>
                Get started
              </Button>
              {index < last && <IconButton icon={<CaretRight />} aria-label="Next slide" variant="solid" color="secondary" size="large" onClick={() => go(index + 1)} />}
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}
