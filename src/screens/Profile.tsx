import { useState } from 'react';
import { ArrowLeft, ArrowRight, GpsFix, PencilSimple } from '@phosphor-icons/react';
import { Avatar, getInitials } from '../components/Avatar/Avatar';
import { AvatarPicker } from '../components/AvatarPicker/AvatarPicker';
import { Button } from '../components/Button/Button';
import { Checkbox, FormControlLabel, FormGroup } from '../components/Checkbox/Checkbox';
import { FormField, FormHelperText, FormLabel, Select, TextField } from '../components/FormField/FormField';
import { IconButton } from '../components/IconButton/IconButton';
import { MobileStepper } from '../components/MobileStepper/MobileStepper';
import { ScreenBackground } from '../components/ScreenBackground/ScreenBackground';
import { Slider } from '../components/Slider/Slider';
import { useOnboarding } from '../app/OnboardingState';
import { navigate } from '../app/router';
import s from './Screen.module.css';
import styles from './Profile.module.css';

const STEPS = 4; // Figma: 3 form steps + a review step (1/4 … 4/4)

// Select options. Figma shows one selected value per field; the rest of each list is sample content for the prototype.
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((v) => ({ value: v, label: v }));
const PACES = ['Under 4:30 min/km', '4:30 - 5:15 min/km', '5:15 - 6:00 min/km', '6:00 - 6:45 min/km', 'Over 6:45 min/km'].map((v) => ({ value: v, label: v }));
const DISTANCES = ['3k', '5k', '10k', 'Half marathon', 'Marathon'].map((v) => ({ value: v, label: v }));
const REASONS = ['Socialize', 'Race', 'Fun', 'Hobby'];

/**
 * Step 1: every field is required except the photo (no photo = initials avatar); the radius slider always has a value.
 * Order = on-screen order, for focusing the first error.
 */
type Step1Field = 'firstName' | 'lastName' | 'gender' | 'area';
const STEP1_FIELDS: Step1Field[] = ['firstName', 'lastName', 'gender', 'area'];
const STEP1_MESSAGES: Record<Step1Field, string> = {
  firstName: 'Enter your first name',
  lastName: 'Enter your last name',
  gender: 'Select your gender',
  area: 'Enter your running area',
};
const fieldId = (f: Step1Field) => `profile-${f}`;

function step1Errors(data: { firstName: string; lastName: string; gender: string; area: string }) {
  const filled: Record<Step1Field, boolean> = {
    firstName: data.firstName.trim() !== '',
    lastName: data.lastName.trim() !== '',
    gender: data.gender !== '',
    area: data.area.trim() !== '',
  };
  return STEP1_FIELDS.filter((f) => !filled[f]);
}

/** Figma "↳ User-profile configuration": three form steps, then a review step with "Create". */
export function Profile({ step }: { step: number }) {
  const { data, update, photo, setPhoto } = useOnboarding();
  const go = (n: number) => navigate(`/profile/${n + 1}`);

  // Errors appear only after the first "Next" click, then update live as fields are filled.
  const [checked, setChecked] = useState(false);
  const missing = step === 0 && checked ? step1Errors(data) : [];
  const errorOf = (f: Step1Field) => (missing.includes(f) ? STEP1_MESSAGES[f] : undefined);
  const statusOf = (f: Step1Field) => (missing.includes(f) ? 'error' : 'default');

  return (
    <div className={s.screen}>
      <ScreenBackground variant="firstLevel" />
      <div className={s.body}>
        <div className={styles.intro}>
          <h1 className={`text-body-xl-bold ${styles.title}`}>Let’s become a Runioner!</h1>
          <p className={`text-body-md-regular ${styles.subtitle}`}>Your profile is almost ready.</p>
        </div>

        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 0) {
              const errors = step1Errors(data);
              if (errors.length > 0) {
                setChecked(true);
                // Move focus to the first missing field; its error message is read out with it.
                document.getElementById(fieldId(errors[0]))?.focus();
                return;
              }
            }
            if (step < STEPS - 1) go(step + 1);
            else navigate('/home'); // "Create": the profile is done; Home is the placeholder for the app
          }}
        >
          <MobileStepper variant="text" steps={STEPS} activeStep={step} />

          {step === 0 && (
            <section className={s.stack16} aria-labelledby="step-title">
              <h2 id="step-title" className={`text-body-lg-semi-bold ${styles.section}`}>
                Tell us about yourself
              </h2>
              <div className={styles.photo}>
                <FormLabel as="span">Upload profile picture</FormLabel>
                <AvatarPicker value={photo} onChange={setPhoto} initials={getInitials(data.firstName, data.lastName)} />
              </div>
              <div className={styles.row}>
                <FormField id={fieldId('firstName')} label="First name" status={statusOf('firstName')} message={errorOf('firstName')}>
                  <TextField aria-required="true" autoComplete="given-name" placeholder="First name" value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
                </FormField>
                <FormField id={fieldId('lastName')} label="Last name" status={statusOf('lastName')} message={errorOf('lastName')}>
                  <TextField aria-required="true" autoComplete="family-name" placeholder="Last name" value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
                </FormField>
              </div>
              <FormField id={fieldId('gender')} label="Gender" status={statusOf('gender')} message={errorOf('gender')}>
                <Select aria-required="true" placeholder="Select" options={GENDERS} value={data.gender} onChange={(e) => update({ gender: e.target.value })} />
              </FormField>
              {/* The area message sits under the whole row, so the location button stays aligned with the input. */}
              <div className={styles.areaField}>
                <div className={styles.fieldAction}>
                  <FormField id={fieldId('area')} label="Your running area" status={statusOf('area')}>
                    <TextField
                      aria-required="true"
                      aria-describedby={errorOf('area') ? `${fieldId('area')}-message` : undefined}
                      autoComplete="street-address"
                      placeholder="Street, city"
                      value={data.area}
                      onChange={(e) => update({ area: e.target.value })}
                    />
                  </FormField>
                  {/* Prototype: fills a sample address instead of asking the browser for the real location. */}
                  <IconButton icon={<GpsFix />} aria-label="Use my current location" variant="ghost" color="primary" size="medium" onClick={() => update({ area: 'Current location (sample)' })} />
                </div>
                {errorOf('area') && (
                  <FormHelperText id={`${fieldId('area')}-message`} status="error">
                    {errorOf('area')}
                  </FormHelperText>
                )}
              </div>
              <div className={styles.slider}>
                <FormLabel as="span" id="radius-label">
                  Running area radius
                </FormLabel>
                <Slider
                  aria-labelledby="radius-label"
                  // Figma: 2–10 km in 2 km steps (5 marks, ends included), starting at 2km.
                  min={2}
                  max={10}
                  step={2}
                  marks
                  value={data.radiusKm}
                  onChange={(v) => update({ radiusKm: v })}
                  formatValue={(v) => `${v}km`}
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className={s.stack16} aria-labelledby="step-title">
              <h2 id="step-title" className={`text-body-lg-semi-bold ${styles.section}`}>
                What’s your running style?
              </h2>
              <FormField label="Pace">
                <Select placeholder="Select your pace" options={PACES} value={data.pace} onChange={(e) => update({ pace: e.target.value })} />
              </FormField>
              <FormField label="Distance">
                <Select placeholder="Select a distance" options={DISTANCES} value={data.distance} onChange={(e) => update({ distance: e.target.value })} />
              </FormField>
              <FormGroup label="Why do you run?">
                {REASONS.map((r) => (
                  <FormControlLabel
                    key={r}
                    label={r}
                    control={
                      <Checkbox
                        checked={data.reasons.includes(r)}
                        onChange={(e) => update({ reasons: e.target.checked ? [...data.reasons, r] : data.reasons.filter((x) => x !== r) })}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </section>
          )}

          {step === 2 && (
            <section className={s.stack16} aria-labelledby="step-title">
              <h2 id="step-title" className={`text-body-lg-semi-bold ${styles.section}`}>
                Where do you usually run?
              </h2>
              <FormGroup label="Allow location services">
                <FormControlLabel
                  label="Allow location services"
                  helperText="Required to show local runs, exact meeting points, and nearby running buddies."
                  control={<Checkbox checked={data.allowLocation} onChange={(e) => update({ allowLocation: e.target.checked })} />}
                />
                <FormControlLabel
                  label="Receive run & invite notifications"
                  helperText="Get instant alerts for Pair Run invites, time changes, and club updates."
                  control={<Checkbox checked={data.allowNotifications} onChange={(e) => update({ allowNotifications: e.target.checked })} />}
                />
              </FormGroup>
            </section>
          )}

          {step === 3 && <Review onEdit={go} />}

          {/* Figma "Container-button": 84px bar stuck to the bottom, full width, translucent, content scrolls behind it. */}
          <div className={styles.actions}>
            {step > 0 && (
              <Button variant="outlined" startIcon={<ArrowLeft />} onClick={() => go(step - 1)}>
                Back
              </Button>
            )}
            <Button type="submit" endIcon={step < STEPS - 1 ? <ArrowRight /> : undefined}>
              {step < STEPS - 1 ? 'Next' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const NOT_SET = 'Not set';

/**
 * Figma step 4/4 (review): the avatar, then one card per form step ("Cotainer-values") with an "Edit" button
 * that goes back to that step. Each row is a label (body-xs) over its value (body-sm semi-bold).
 */
function Review({ onEdit }: { onEdit: (stepIndex: number) => void }) {
  const { data, photo } = useOnboarding();
  const or = (v: string) => v.trim() || NOT_SET;
  const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

  const cards: Array<{ title: string; step: number; rows: Array<[string, string]> }> = [
    {
      title: 'Tell us about yourself',
      step: 0,
      rows: [
        ['First name', or(data.firstName)],
        ['Last name', or(data.lastName)],
        ['Gender', or(data.gender)],
        ['Your running area', or(data.area)],
        ['Running area radius', `${data.radiusKm}km`],
      ],
    },
    {
      title: 'What’s your running style?',
      step: 1,
      rows: [
        ['Pace', or(data.pace)],
        ['Distance', or(data.distance)],
        ['Why do you run?', data.reasons.length ? data.reasons.join(', ') : NOT_SET],
      ],
    },
    {
      title: 'Where do you usually run?',
      step: 2,
      rows: [
        ['Allow location services', data.allowLocation ? 'Yes' : 'No'],
        ['Receive run & invite notifications', data.allowNotifications ? 'Yes' : 'No'],
      ],
    },
  ];

  return (
    <section className={styles.review} aria-labelledby="step-title">
      <h2 id="step-title" className={`text-body-lg-semi-bold ${styles.section}`}>
        Review your profile
      </h2>
      <div className={styles.reviewAvatar}>
        <Avatar size={120} src={photo} alt={photo ? 'Your profile picture' : undefined} initials={getInitials(data.firstName, data.lastName)} label={fullName || undefined} />
      </div>
      {cards.map((c) => (
        <section key={c.step} className={styles.card} aria-labelledby={`review-${c.step}`}>
          <div className={styles.cardHead}>
            <h3 id={`review-${c.step}`} className={`text-body-sm-semi-bold ${styles.section}`}>
              {c.title}
            </h3>
            <Button variant="ghost" size="small" startIcon={<PencilSimple />} aria-label={`Edit: ${c.title}`} onClick={() => onEdit(c.step)}>
              Edit
            </Button>
          </div>
          <dl className={styles.list}>
            {c.rows.map(([label, value]) => (
              <div key={label} className={styles.item}>
                <dt className="text-body-xs-regular">{label}</dt>
                <dd className="text-body-sm-semi-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </section>
  );
}
