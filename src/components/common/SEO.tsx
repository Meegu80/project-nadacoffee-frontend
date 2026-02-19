import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

const DEFAULT_DESCRIPTION = '나다커피 - 당신을 위한 최고의 커피 경험. 스페셜티 원두, 합리적인 가격, 전국 3,500개 가맹점.';
const DEFAULT_KEYWORDS = '나다커피, 커피, 카페, 스페셜티, 아이스커피, 라떼, 에이드, 디저트';
const DEFAULT_OG_IMAGE = '/og-image.png';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
}: SEOProps) => {
  const fullTitle = `${title} | NADA COFFEE`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEO;
