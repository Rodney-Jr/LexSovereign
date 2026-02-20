import React from 'react';
import { useLocation } from '../utils/ssr-compat';
import { Helmet } from '../utils/ssr-compat';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    type?: string;
    schema?: Record<string, any> | Record<string, any>[];
    ogImage?: string;
}

const SITE_URL = 'https://nomosdesk.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

export default function SEO({
    title,
    description,
    canonical,
    type = 'website',
    schema,
    ogImage,
}: SEOProps) {
    const location = useLocation();
    const fullTitle = `${title} | NomosDesk`;
    const canonicalUrl = canonical
        ? `${SITE_URL}${canonical}`
        : `${SITE_URL}${location.pathname}`;
    const imageUrl = ogImage || DEFAULT_OG_IMAGE;

    const schemaArray = schema
        ? Array.isArray(schema)
            ? schema
            : [schema]
        : null;

    return (
        <Helmet>
            {/* Core */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="NomosDesk" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={`${title} — NomosDesk`} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={`${title} — NomosDesk`} />

            {/* Structured Data */}
            {schemaArray && schemaArray.map((s, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(s)}
                </script>
            ))}
        </Helmet>
    );
}
