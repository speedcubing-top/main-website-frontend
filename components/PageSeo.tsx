import React from 'react';
import Head from 'next/head';
import { PageSeo as PageSeoProps } from '../utils/NoteServerSideProps';

// The og: keys match the site-wide defaults in _app, so these replace them instead of adding duplicates.
const PageSeo: React.FC<PageSeoProps> = ({ title, type, publishedTime, canonical, description, jsonLd, noindex }) => (
  <Head>
    {canonical && <link rel="canonical" href={canonical} />}
    {description && <meta name="description" content={description} />}
    {title && <meta key="og:title" property="og:title" content={title} />}
    {description && <meta key="og:description" property="og:description" content={description} />}
    {canonical && <meta key="og:url" property="og:url" content={canonical} />}
    {type && <meta key="og:type" property="og:type" content={type} />}
    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
    {noindex && <meta name="robots" content="noindex" />}
    {jsonLd && (
      <script
        type="application/ld+json"
        // Escaped so a note title containing </script> can't end the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    )}
  </Head>
);

export default PageSeo;
