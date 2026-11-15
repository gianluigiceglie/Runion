import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, getInitials, type AvatarSize, type AvatarVariant } from './Avatar';
import photo from '../../assets/photos/slide1-front.jpg'; // sample photo for the Image stories

const SIZES: AvatarSize[] = [120, 80, 60, 40, 32, 24];
const VARIANTS: AvatarVariant[] = ['circular', 'rounded', 'square'];

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { size: 80, variant: 'circular', initials: getInitials('Runion', 'Runner'), badge: false },
  argTypes: {
    size: { control: 'select', options: SIZES },
    variant: { control: 'inline-radio', options: VARIANTS },
    src: { control: 'text' },
    badge: { control: 'boolean' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Content=Text: initials from first + last name. */
export const Initials: Story = {};

/** Content=Icon: no photo and no initials. */
export const Icon: Story = { args: { initials: undefined } };

/** Content=Image. */
export const Image: Story = { args: { src: photo, alt: 'Profile picture' } };

/** Badge on: success status dot, with screen-reader text. */
export const WithBadge: Story = { args: { badge: true, badgeLabel: 'Online' } };

/** A photo that fails to load falls back to the initials (or the icon without initials). */
export const BrokenImage: Story = { args: { src: '/does-not-exist.jpg', alt: 'Profile picture' } };

/** Every size and shape for each content type, with and without badge. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {VARIANTS.map((variant) =>
        [false, true].map((badge) => (
          <div key={`${variant}-${badge}`} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {SIZES.map((size) => (
              <Avatar key={`t${size}`} size={size} variant={variant} badge={badge} initials="RN" />
            ))}
            {SIZES.map((size) => (
              <Avatar key={`i${size}`} size={size} variant={variant} badge={badge} />
            ))}
            {SIZES.map((size) => (
              <Avatar key={`p${size}`} size={size} variant={variant} badge={badge} src={photo} alt="" />
            ))}
          </div>
        )),
      )}
    </div>
  ),
};
