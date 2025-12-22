// components/Seo.js
import Head from 'next/head';

const Seo = ({ title, description, keywords, url }) => {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <link rel="canonical" href={url} />
        </Head>
    );
};

Seo.defaultProps = {
    title: 'Picfix.ai - Enhance and Restore Photos with AI',
    description: 'Enhance and restore photos online using AI-powered tools. Try our AI models for photo colorization, background removal, and more!',
    keywords: 'ai photo enhancer, image colorization, photo restoration, remove background, photo editor, photo enhancement',
    url: 'https://www.picfix.ai',
};

export default Seo;
