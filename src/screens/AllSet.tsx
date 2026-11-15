import { PencilSimple } from '@phosphor-icons/react';
import { Avatar, getInitials } from '../components/Avatar/Avatar';
import { Button } from '../components/Button/Button';
import { Logo } from '../components/Logo/Logo';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { useOnboarding } from '../app/OnboardingState';
import { navigate } from '../app/router';
import s from './Screen.module.css';
import styles from './AllSet.module.css';

const NOT_SET = 'Not set';

interface Section {
  title: string;
  /** Profile step to go back to (1–3). */
  step: number;
  rows: Array<[label: string, value: string]>;
}

/**
 * End of sign-up (not in Figma): the profile summary, one section per profile step, each with an "Edit" link back
 * to that step. "Restart prototype" clears everything.
 */
export function AllSet() {
  const { data, reset, photo } = useOnboarding();
  const firstName = data.firstName.trim();
  const fullName = `${firstName} ${data.lastName.trim()}`.trim();
  const or = (v: string) => v.trim() || NOT_SET;

  const sections: Section[] = [
    {
      title: 'About you',
      step: 1,
      rows: [
        ['Name', or(fullName)],
        ['Email', or(data.email)],
        ['Gender', or(data.gender)],
        ['Running area', data.area.trim() ? `${data.area.trim()} · ${data.radiusKm}km radius` : NOT_SET],
      ],
    },
    {
      title: 'Running style',
      step: 2,
      rows: [
        ['Pace', or(data.pace)],
        ['Distance', or(data.distance)],
        ['Why you run', data.reasons.length ? data.reasons.join(', ') : NOT_SET],
      ],
    },
    {
      title: 'Permissions',
      step: 3,
      rows: [
        ['Location services', data.allowLocation ? 'Allowed' : 'Not allowed'],
        ['Run & invite notifications', data.allowNotifications ? 'On' : 'Off'],
      ],
    },
  ];

  return (
    <div className={s.screen}>
      <ScreenBackground variant="slide3" />
      <div className={s.body}>
        <div className={s.center}>
          <div className={styles.content}>
            <Logo variant="short" height={57} />
            <Avatar size={80} src={photo} alt={photo ? 'Your profile picture' : undefined} initials={getInitials(data.firstName, data.lastName)} />
            <div className={styles.heading}>
              <h1 className={`text-h2 ${s.h2}`}>{firstName ? `You’re all set, ${firstName}!` : 'You’re all set!'}</h1>
              <p className={`text-body-md-regular ${s.lead}`}>Your Runion profile is ready. Here’s what you told us.</p>
            </div>

            {sections.map((sec) => (
              <section key={sec.title} className={styles.card} aria-labelledby={`summary-${sec.step}`}>
                <div className={styles.cardHead}>
                  <h2 id={`summary-${sec.step}`} className={`text-body-md-semi-bold ${styles.cardTitle}`}>
                    {sec.title}
                  </h2>
                  <Button variant="ghost" size="small" startIcon={<PencilSimple />} aria-label={`Edit ${sec.title.toLowerCase()}`} onClick={() => navigate(`/profile/${sec.step}`)}>
                    Edit
                  </Button>
                </div>
                <dl className={styles.list}>
                  {sec.rows.map(([k, v]) => (
                    <div key={k} className={styles.item}>
                      <dt className="text-body-xs-regular">{k}</dt>
                      <dd className="text-body-sm-semi-bold" data-empty={v === NOT_SET || undefined}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
        <div className={s.footer}>
          <Button
            onClick={() => {
              reset();
              navigate('/', { replace: true });
            }}
          >
            Restart prototype
          </Button>
        </div>
      </div>
    </div>
  );
}
