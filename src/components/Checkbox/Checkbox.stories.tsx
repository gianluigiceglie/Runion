import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox, FormControlLabel, FormGroup } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Accept', defaultChecked: false, indeterminate: false, disabled: false, onChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

/** Figma <FormControlLabel> | Checkbox: the whole row toggles. */
export const WithLabel: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 8 }}>
      <FormControlLabel control={<Checkbox {...args} aria-label={undefined} />} label="Remember me" />
      <FormControlLabel control={<Checkbox />} label="Label at start" labelPlacement="start" />
      <FormControlLabel control={<Checkbox />} label="With helper text" helperText="Shown under the label" />
      <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
    </div>
  ),
};

/** Figma <FormGroup> | <Checkbox>: State = Enabled. Includes a "select all" with indeterminate state. */
export const Group: Story = {
  render: function GroupStory() {
    const [prefs, setPrefs] = useState({ news: true, events: false, tips: true });
    const values = Object.values(prefs);
    const all = values.every(Boolean);
    const some = values.some(Boolean) && !all;
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <FormControlLabel
          control={<Checkbox checked={all} indeterminate={some} onChange={(e) => setPrefs({ news: e.target.checked, events: e.target.checked, tips: e.target.checked })} />}
          label="All notifications"
        />
        <FormGroup label="Notifications" helperText="Choose what we send you">
          {(Object.keys(prefs) as Array<keyof typeof prefs>).map((k) => (
            <FormControlLabel key={k} control={<Checkbox checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} />} label={k[0].toUpperCase() + k.slice(1)} />
          ))}
        </FormGroup>
      </div>
    );
  },
};

/** Figma <FormGroup> | <Checkbox>: State = Error. */
export const GroupError: Story = {
  render: () => (
    <FormGroup label="Interests" helperText="Pick at least one" state="error" errorText="Select at least one interest">
      <FormControlLabel control={<Checkbox />} label="Running" />
      <FormControlLabel control={<Checkbox />} label="Cycling" />
    </FormGroup>
  ),
};

/** Figma <FormGroup> | <Checkbox>: State = Disabled. */
export const GroupDisabled: Story = {
  render: () => (
    <FormGroup label="Disabled group" helperText="Not available" state="disabled">
      <FormControlLabel control={<Checkbox defaultChecked />} label="Option A" />
      <FormControlLabel control={<Checkbox />} label="Option B" />
    </FormGroup>
  ),
};
