import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatCircle, House, MapPin, Star, User } from '@phosphor-icons/react';
import { TabPanel, Tabs, type TabItem, type TabsProps } from './Tabs';

const textItems: TabItem[] = [
  { value: 'explore', label: 'Explore' },
  { value: 'reunions', label: 'Reunions' },
  { value: 'chat', label: 'Chat' },
];
const iconItems: TabItem[] = [
  { value: 'home', label: 'Home', icon: <House /> },
  { value: 'map', label: 'Map', icon: <MapPin /> },
  { value: 'chat', label: 'Chat', icon: <ChatCircle /> },
  { value: 'me', label: 'Me', icon: <User /> },
];

/** Keeps the selected tab in state so the story is interactive. */
function Stateful(props: Omit<TabsProps, 'value' | 'onChange'> & { initial?: string; withPanels?: boolean }) {
  const { initial, withPanels, ...rest } = props;
  const [value, setValue] = useState(initial ?? rest.items[0]?.value ?? '');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Tabs {...rest} value={value} onChange={setValue} />
      {withPanels &&
        rest.items.map((t) => (
          <TabPanel key={t.value} tabsId={rest.id} value={t.value} current={value}>
            Content for {String(t.label)}
          </TabPanel>
        ))}
    </div>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { id: 'story-tabs', 'aria-label': 'Sections', items: textItems, value: 'explore', onChange: () => {}, variant: 'standard', iconPosition: 'left' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['standard', 'scrollable', 'fullWidth'] },
    iconPosition: { control: 'inline-radio', options: ['left', 'up', 'right'] },
    value: { control: false },
    onChange: { control: false },
  },
  render: (args) => <Stateful {...args} initial={args.value} withPanels />,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const WithDisabledTab: Story = {
  args: { items: [...textItems, { value: 'off', label: 'Off', disabled: true }] },
};

export const FullWidthIconsUp: Story = {
  args: { items: iconItems, value: 'home', variant: 'fullWidth', iconPosition: 'up' },
};

export const Scrollable: Story = {
  args: {
    variant: 'scrollable',
    value: 't1',
    items: Array.from({ length: 8 }, (_, i) => ({ value: `t${i + 1}`, label: `Tab ${i + 1}`, icon: <Star /> })),
  },
  parameters: { viewport: { defaultViewport: 'phone' } },
};
