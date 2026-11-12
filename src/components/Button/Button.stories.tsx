import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { PersonSimpleRun } from '@phosphor-icons/react';
import { Button, type ButtonColor, type ButtonSize, type ButtonVariant } from './Button';
import { iconArg } from '../../stories/icons';

const variants: ButtonVariant[] = ['solid', 'outlined', 'ghost'];
const colors: ButtonColor[] = ['primary', 'secondary', 'danger', 'warning', 'info', 'success'];
const sizes: ButtonSize[] = ['large', 'medium', 'small'];

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button label', variant: 'solid', color: 'primary', size: 'medium', loading: false, disabled: false, fullWidth: false, onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    color: { control: 'select', options: colors },
    size: { control: 'inline-radio', options: sizes },
    startIcon: iconArg,
    endIcon: iconArg,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithIcons: Story = {
  args: { startIcon: <PersonSimpleRun />, endIcon: <PersonSimpleRun /> },
};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

/** Every variant × colour (Figma: Variant / Color). */
export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {colors.map((color) => (
            <Button key={color} {...args} variant={variant} color={color}>
              {color}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Figma: Size = Large (56) / Medium (48) / Small (30). */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} startIcon={<PersonSimpleRun />}>
          {size}
        </Button>
      ))}
    </div>
  ),
};
