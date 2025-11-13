import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    author,
    type = 'website',
    image,
    url,
    publishedTime,
    modifiedTime,
    category,
    tags = []
}) => {
    const siteName = 'Australian Nepalese Multicultural Centre';
    const defaultDescription = 'Australian Nepalese Multicultural Centre (ANMC) - Supporting the Nepalese and multicultural community in Australia through cultural programs, social services, and community engagement.';
    const defaultKeywords = 'ANMC, Australian Nepalese, Multicultural Centre, Nepalese Community Australia, Community Services, Cultural Programs';

    const seoTitle = title ? `${title} | ${siteName}` : siteName;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoImage = image || '/logo512.png';
    const seoUrl = url || '';

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={seoKeywords} />
            {author && <meta name="author" content={author} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={seoDescription} />
            {seoImage && <meta property="og:image" content={seoImage} />}
            {seoUrl && <meta property="og:url" content={seoUrl} />}
            <meta property="og:site_name" content={siteName} />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}
            {category && <meta property="article:section" content={category} />}
            {Array.isArray(tags) && tags.length > 0 && tags.map((tag, index) => (
                <meta key={index} property="article:tag" content={tag} />
            ))}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            {seoImage && <meta name="twitter:image" content={seoImage} />}

            {/* Canonical URL */}
            {seoUrl && <link rel="canonical" href={seoUrl} />}
        </Helmet>
    );
};

export default SEO;
