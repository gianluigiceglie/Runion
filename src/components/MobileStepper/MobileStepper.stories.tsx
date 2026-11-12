import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileStepper, type MobileStepperProps } from './MobileStepper';

function Stateful(props: MobileStepperProps) {
  const [step, setStep] = useState(props.activeStep);
  return (
    <MobileStepper
      {...props}
      activeStep={step}
      onBack={props.variant === 'text' ? undefined : () => setStep((s) => s - 1)}
      onNext={props.variant === 'text' ? undefined : () => setStep((s) => s + 1)}
    />
  );
}

const meta = {
  title: 'Components/MobileStepper',
  component: MobileStepper,
  args: { steps: 4, activeStep: 0, variant: 'dots', backLabel: 'Back', nextLabel: 'Next' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['dots', 'text'] },
    activeStep: { control: { type: 'number', min: 0 } },
    onBack: { control: false },
    onNext: { control: false },
  },
  // Remount when the controls change so the interactive step resets.
  render: (args) => <Stateful key={`${args.steps}-${args.activeStep}-${args.variant}`} {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 343 }}><Story /></div>],
} satisfies Meta<typeof MobileStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dots: Story = {};

export const Text: Story = { args: { variant: 'text', activeStep: 1 } };
