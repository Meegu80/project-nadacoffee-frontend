import type { Meta, StoryObj } from '@storybook/react';
import Skeleton from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Common/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: 'w-32 h-10',
  },
};

export const Circle: Story = {
  args: {
    className: 'w-20 h-20 rounded-full',
  },
};

export const LargeBanner: Story = {
  args: {
    className: 'w-full h-64 rounded-[40px]',
  },
};
