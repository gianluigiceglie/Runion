import { useEffect, useState } from 'react';
import { PersonSimpleRun, Star, House, MapPin, ChatCircle, User } from '@phosphor-icons/react';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormField,
  FormGroup,
  IconButton,
  MobileStepper,
  PasswordField,
  Select,
  Slider,
  TabPanel,
  Tabs,
  TextArea,
  TextField,
  type ButtonColor,
  type ButtonSize,
  type ButtonVariant,
  type IconButtonColor,
  type IconButtonSize,
} from '../components';
import styles from './Gallery.module.css';

const VARIANTS: ButtonVariant[] = ['solid', 'outlined', 'ghost'];
const BUTTON_COLORS: ButtonColor[] = ['primary', 'secondary', 'danger', 'warning', 'info', 'success'];
const ICON_COLORS: IconButtonColor[] = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
const BUTTON_SIZES: ButtonSize[] = ['large', 'medium', 'small'];
const ICON_SIZES: IconButtonSize[] = ['large', 'medium', 'small', 'xsmall'];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

type Theme = 'auto' | 'light' | 'dark';

function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('runion-gallery-theme') as Theme) || 'auto';
    } catch {
      return 'auto';
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('runion-gallery-theme', theme);
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
  }, [theme]);
  return (
    <Tabs
      id="theme"
      aria-label="Theme"
      value={theme}
      onChange={(v) => setTheme(v as Theme)}
      items={[
        { value: 'auto', label: 'Auto' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ]}
    />
  );
}

const SECTIONS = ['Button', 'IconButton', 'Tabs', 'FormField', 'Divider', 'Slider', 'Checkbox', 'MobileStepper'];

export function Gallery() {
  const [tab, setTab] = useState('explore');
  const [tab2, setTab2] = useState('home');
  const [tab3, setTab3] = useState('t1');
  const [step, setStep] = useState(1);
  const [distance, setDistance] = useState(30);
  const [prefs, setPrefs] = useState({ news: true, events: false, tips: true });
  const allPrefs = Object.values(prefs);
  const someChecked = allPrefs.some(Boolean) && !allPrefs.every(Boolean);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Runion components</h1>
        <ThemeSwitch />
        <nav className={styles.nav} aria-label="Components">
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s.toLowerCase()}`}>
              {s}
            </a>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <p className={styles.note}>Hover, press and use Tab on any component to see its interactive states.</p>

        {/* ------------------------------------------------------------ Button */}
        <section id="button" className={styles.section}>
          <h2>Button</h2>
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.stack}>
              <p className={styles.eyebrow}>{variant}</p>
              <div className={styles.row}>
                {BUTTON_COLORS.map((color) => (
                  <Button key={color} variant={variant} color={color}>
                    {cap(color)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <p className={styles.eyebrow}>Sizes, with icons</p>
          <div className={styles.row}>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} size={size} startIcon={<PersonSimpleRun />} endIcon={<PersonSimpleRun />}>
                {cap(size)}
              </Button>
            ))}
          </div>
          <p className={styles.eyebrow}>Disabled and loading</p>
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.row}>
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} loading>
                Loading
              </Button>
            </div>
          ))}
          <Button fullWidth size="large">
            Full width
          </Button>
        </section>

        {/* -------------------------------------------------------- IconButton */}
        <section id="iconbutton" className={styles.section}>
          <h2>IconButton</h2>
          {VARIANTS.map((variant) => (
            <div key={variant} className={styles.stack}>
              <p className={styles.eyebrow}>{variant}</p>
              <div className={styles.row}>
                {ICON_COLORS.map((color) => (
                  <IconButton key={color} variant={variant} color={color} icon={<PersonSimpleRun />} aria-label={`${cap(color)} ${variant}`} />
                ))}
              </div>
            </div>
          ))}
          <p className={styles.eyebrow}>Sizes</p>
          <div className={styles.row}>
            {ICON_SIZES.map((size) => (
              <IconButton key={size} size={size} icon={<PersonSimpleRun />} aria-label={`Size ${size}`} />
            ))}
          </div>
          <p className={styles.eyebrow}>Disabled and loading</p>
          <div className={styles.row}>
            {VARIANTS.map((variant) => (
              <IconButton key={variant} variant={variant} disabled icon={<PersonSimpleRun />} aria-label={`Disabled ${variant}`} />
            ))}
            {VARIANTS.map((variant) => (
              <IconButton key={`l-${variant}`} variant={variant} loading icon={<PersonSimpleRun />} aria-label={`Loading ${variant}`} />
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------------- Tabs */}
        <section id="tabs" className={styles.section}>
          <h2>Tabs</h2>
          <p className={styles.eyebrow}>Standard</p>
          <Tabs
            id="demo-standard"
            aria-label="Standard tabs"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'explore', label: 'Explore' },
              { value: 'reunions', label: 'Reunions' },
              { value: 'chat', label: 'Chat' },
              { value: 'off', label: 'Off', disabled: true },
            ]}
          />
          {['explore', 'reunions', 'chat'].map((v) => (
            <TabPanel key={v} tabsId="demo-standard" value={v} current={tab} className={styles.panel}>
              Panel: {cap(v)}
            </TabPanel>
          ))}
          <p className={styles.eyebrow}>Full width, icons up</p>
          <Tabs
            id="demo-full"
            aria-label="Full width tabs"
            variant="fullWidth"
            iconPosition="up"
            value={tab2}
            onChange={setTab2}
            items={[
              { value: 'home', label: 'Home', icon: <House /> },
              { value: 'map', label: 'Map', icon: <MapPin /> },
              { value: 'chat', label: 'Chat', icon: <ChatCircle /> },
              { value: 'me', label: 'Me', icon: <User /> },
            ]}
          />
          <p className={styles.eyebrow}>Scrollable, icons left</p>
          <Tabs
            id="demo-scroll"
            aria-label="Scrollable tabs"
            variant="scrollable"
            value={tab3}
            onChange={setTab3}
            items={Array.from({ length: 8 }, (_, i) => ({ value: `t${i + 1}`, label: `Tab ${i + 1}`, icon: <Star /> }))}
          />
        </section>

        {/* --------------------------------------------------------- FormField */}
        <section id="formfield" className={styles.section}>
          <h2>FormField</h2>
          <FormField label="Name" helperText="As it appears on your profile">
            <TextField placeholder="Your name" defaultValue="Alex" autoComplete="name" />
          </FormField>
          <FormField label="Password" helperText="At least 8 characters" required>
            <PasswordField placeholder="Password" autoComplete="new-password" />
          </FormField>
          <FormField label="About you">
            <TextArea placeholder="A few words" />
          </FormField>
          <FormField label="City">
            <Select
              placeholder="Choose a city"
              options={[
                { value: 'rome', label: 'Rome' },
                { value: 'milan', label: 'Milan' },
                { value: 'naples', label: 'Naples' },
              ]}
            />
          </FormField>
          <p className={styles.eyebrow}>States</p>
          <FormField label="Email" status="error" message="Enter a valid email address">
            <TextField defaultValue="alex@" type="email" />
          </FormField>
          <FormField label="Username" status="success" message="Available">
            <TextField defaultValue="alex_runs" />
          </FormField>
          <FormField label="Medium size" size="medium">
            <TextField placeholder="40px high" />
          </FormField>
          <FormField label="Disabled" disabled helperText="Not editable">
            <TextField defaultValue="Read only value" />
          </FormField>
          <FormField label="Select with error" status="error" message="Choose one">
            <Select placeholder="Choose" options={[{ value: 'a', label: 'Option A' }]} />
          </FormField>
        </section>

        {/* ----------------------------------------------------------- Divider */}
        <section id="divider" className={styles.section}>
          <h2>Divider</h2>
          <Divider />
          <div className={styles.dividerBox}>
            <span>Left</span>
            <Divider orientation="vertical" />
            <span>Right</span>
          </div>
        </section>

        {/* ------------------------------------------------------------ Slider */}
        <section id="slider" className={styles.section}>
          <h2>Slider</h2>
          <Slider aria-label="Distance" min={0} max={100} value={distance} onChange={setDistance} formatValue={(v) => `${v} km`} />
          <p className={styles.note}>Value: {distance} km</p>
          <p className={styles.eyebrow}>With marks</p>
          <Slider aria-label="Level" min={0} max={5} step={1} defaultValue={2} marks />
          <p className={styles.eyebrow}>Disabled</p>
          <Slider aria-label="Disabled slider" defaultValue={40} disabled />
        </section>

        {/* ---------------------------------------------------------- Checkbox */}
        <section id="checkbox" className={styles.section}>
          <h2>Checkbox</h2>
          <div className={styles.row}>
            <Checkbox aria-label="Unchecked" />
            <Checkbox aria-label="Checked" defaultChecked />
            <Checkbox aria-label="Indeterminate" indeterminate />
            <Checkbox aria-label="Disabled" disabled />
            <Checkbox aria-label="Disabled checked" disabled defaultChecked />
          </div>
          <p className={styles.eyebrow}>With label</p>
          <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
          <FormControlLabel control={<Checkbox />} label="Label at start" labelPlacement="start" />
          <FormControlLabel control={<Checkbox />} label="With helper text" helperText="Shown under the label" />
          <p className={styles.eyebrow}>FormGroup</p>
          <FormControlLabel
            control={
              <Checkbox
                checked={allPrefs.every(Boolean)}
                indeterminate={someChecked}
                onChange={(e) => setPrefs({ news: e.target.checked, events: e.target.checked, tips: e.target.checked })}
              />
            }
            label="All notifications"
          />
          <FormGroup label="Notifications" helperText="Choose what we send you">
            <FormControlLabel control={<Checkbox checked={prefs.news} onChange={(e) => setPrefs({ ...prefs, news: e.target.checked })} />} label="News" />
            <FormControlLabel control={<Checkbox checked={prefs.events} onChange={(e) => setPrefs({ ...prefs, events: e.target.checked })} />} label="Events" />
            <FormControlLabel control={<Checkbox checked={prefs.tips} onChange={(e) => setPrefs({ ...prefs, tips: e.target.checked })} />} label="Tips" />
          </FormGroup>
          <FormGroup label="Interests" helperText="Pick at least one" state="error" errorText="Select at least one interest">
            <FormControlLabel control={<Checkbox />} label="Running" />
            <FormControlLabel control={<Checkbox />} label="Cycling" />
          </FormGroup>
          <FormGroup label="Disabled group" helperText="Not available" state="disabled">
            <FormControlLabel control={<Checkbox defaultChecked />} label="Option A" />
            <FormControlLabel control={<Checkbox />} label="Option B" />
          </FormGroup>
        </section>

        {/* ----------------------------------------------------- MobileStepper */}
        <section id="mobilestepper" className={styles.section}>
          <h2>MobileStepper</h2>
          <p className={styles.eyebrow}>Dots</p>
          <MobileStepper steps={4} activeStep={step} onBack={() => setStep((s) => s - 1)} onNext={() => setStep((s) => s + 1)} />
          <p className={styles.eyebrow}>Text</p>
          <MobileStepper variant="text" steps={4} activeStep={step} />
        </section>
      </main>
    </div>
  );
}
