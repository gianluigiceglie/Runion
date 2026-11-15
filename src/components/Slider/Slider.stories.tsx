import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { 'aria-label': 'Distance', min: 0, max: 100, step: 1, defaultValue: 30, marks: false, showValues: true, disabled: false, onChange: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 343 }}><Story /></div>],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Figma <Slider> as used on the profile screen: 2–10 km in 2 km steps, marks, "2km" selected. Drag to update the left value. */
export const AsInFigma: Story = {
  args: { 'aria-label': 'Running area radius', min: 2, max: 10, step: 2, defaultValue: 2, marks: true, formatValue: (v: number) => `${v}km` },
};

export const WithUnits: Story = {
  args: { formatValue: (v: number) => `${v} km` },
};

/** Figma _SliderMark: one mark per step. */
export const WithMarks: Story = {
  args: { 'aria-label': 'Level', min: 0, max: 5, step: 1, defaultValue: 2, marks: true },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 40 } };
