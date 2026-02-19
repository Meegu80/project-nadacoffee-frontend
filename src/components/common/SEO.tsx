import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
}

const SEO = ({ title, description = "나다커피 - 당신을 위한 최고의 커피 경험" }: SEOProps) => {
  return (
    <Helmet>
      <title>{title} | NADA COFFEE</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | NADA COFFEE`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;
