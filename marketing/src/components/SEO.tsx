import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    type?: string;
    schema?: Record<string, any>;
}

export default function SEO({
    title,
    description,
    canonical,
    type = 'website',
    schema
}: SEOProps) {
    const siteUrl = 'https://nomosdesk.com';
    const fullTitle = `${title} | NomosDesk`;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content="NomosDesk" />
            {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
}
