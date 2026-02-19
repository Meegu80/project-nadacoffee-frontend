import type { Meta, StoryObj } from '@storybook/react';
import SEO from './SEO';
import { HelmetProvider } from 'react-helmet-async';

const meta: Meta<typeof SEO> = {
  title: 'Common/SEO',
  component: SEO,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HelmetProvider>
        <Story />
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-xs text-gray-500 font-mono">
            이 컴포넌트는 눈에 보이지 않지만, 브라우저 탭의 제목과 메타 태그를 변경합니다.
          </p>
        </div>
      </HelmetProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SEO>;

export const Default: Story = {
  args: {
    title: '홈',
    description: '나다커피 공식 온라인 스토어입니다.',
  },
};

export const ProductDetail: Story = {
  args: {
    title: '에스프레소 블렌드',
    description: '깊고 진한 풍미의 나다커피 시그니처 블렌드 원두입니다.',
  },
};
