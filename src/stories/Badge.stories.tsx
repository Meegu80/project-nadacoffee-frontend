import type { Meta, StoryObj } from '@storybook/react';
import Badge from '../components/common/Badge';

const meta: Meta<typeof Badge> = {
    title: 'Common/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['yellow', 'dark', 'red', 'blue', 'green', 'gray', 'orange'],
        },
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md'],
        },
        outline: {
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: {
        children: 'NADA Badge',
        variant: 'yellow',
        size: 'sm',
        outline: false,
    },
};

export const Outline: Story = {
    args: {
        children: 'Outline Badge',
        variant: 'dark',
        size: 'sm',
        outline: true,
    },
};

export const Colors: Story = {
    render: () => (
        <div className="flex gap-2">
            <Badge variant="yellow">Yellow</Badge>
            <Badge variant="dark">Dark</Badge>
            <Badge variant="red">Red</Badge>
            <Badge variant="blue">Blue</Badge>
            <Badge variant="green">Green</Badge>
            <Badge variant="orange">Orange</Badge>
            <Badge variant="gray">Gray</Badge>
        </div>
    ),
};
