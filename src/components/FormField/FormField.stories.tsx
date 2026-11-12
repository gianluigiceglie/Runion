import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField, PasswordField, Select, TextArea, TextField } from './FormField';

const cities = [
  { value: 'rome', label: 'Rome' },
  { value: 'milan', label: 'Milan' },
  { value: 'naples', label: 'Naples' },
];

const meta = {
  title: 'Components/FormField',
  component: FormField,
  args: {
    label: 'Name',
    helperText: 'As it appears on your profile',
    message: undefined,
    status: 'default',
    disabled: false,
    required: false,
    size: 'large',
    children: null,
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['default', 'error', 'success'] },
    size: { control: 'inline-radio', options: ['large', 'medium'] },
    children: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 343 }}><Story /></div>],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma: Type = Text-field. Clear button appears when there is a value. */
export const Text: Story = {
  render: (args) => (
    <FormField {...args}>
      <TextField placeholder="Your name" defaultValue="Alex" />
    </FormField>
  ),
};

/** Figma: Type = Password-field. Eye button shows/hides the value. */
export const Password: Story = {
  args: { label: 'Password', helperText: 'At least 8 characters', required: true },
  render: (args) => (
    <FormField {...args}>
      <PasswordField placeholder="Password" autoComplete="new-password" />
    </FormField>
  ),
};

/** Figma: Type = TextArea-field. */
export const TextAreaField: Story = {
  args: { label: 'About you', helperText: undefined },
  render: (args) => (
    <FormField {...args}>
      <TextArea placeholder="A few words" />
    </FormField>
  ),
};

/** Figma: Type = Select. Native select, so it uses the phone's own picker. */
export const SelectField: Story = {
  args: { label: 'City', helperText: undefined },
  render: (args) => (
    <FormField {...args}>
      <Select placeholder="Choose a city" options={cities} />
    </FormField>
  ),
};

export const WithError: Story = {
  args: { label: 'Email', helperText: undefined, status: 'error', message: 'Enter a valid email address' },
  render: (args) => (
    <FormField {...args}>
      <TextField type="email" defaultValue="alex@" />
    </FormField>
  ),
};

export const Success: Story = {
  args: { label: 'Username', helperText: undefined, status: 'success', message: 'Available' },
  render: (args) => (
    <FormField {...args}>
      <TextField defaultValue="alex_runs" />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: { label: 'Disabled', helperText: 'Not editable', disabled: true },
  render: (args) => (
    <FormField {...args}>
      <TextField defaultValue="Read only value" />
    </FormField>
  ),
};
