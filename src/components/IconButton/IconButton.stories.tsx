import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PersonSimpleRun } from '@phosphor-icons/react';
import { IconButton, type IconButtonColor, type IconButtonSize, type IconButtonVariant } from './IconButton';
import { iconArg } from '../../stories/icons';

const variants: IconButtonVariant[] = ['solid', 'outlined', 'ghost'];
const colors: IconButtonColor[] = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];
const sizes: IconButtonSize[] = ['large', 'medium', 'small', 'xsmall'];

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: <PersonSimpleRun />, 'aria-label': 'Start run', variant: 'solid', color: 'primary', size: 'medium', loading: false, disabled: false, onClick: fn() },
  argTypes: {
    icon: { ...iconArg, options: iconArg.options.filter((o) => o !== 'none') },
    variant: { control: 'inline-radio', options: variants },
    color: { control: 'select', options: colors },
    size: { control: 'inline-radio', options: sizes },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {colors.map((color) => (
            <IconButton key={color} {...args} variant={variant} color={color} aria-label={`${color} ${variant}`} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Figma: Large 56 · Medium 48 · Small 40 · x-Small 24. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {sizes.map((size) => (
        <IconButton key={size} {...args} size={size} aria-label={`Size ${size}`} />
      ))}
    </div>
  ),
};
