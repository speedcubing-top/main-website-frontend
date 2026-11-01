import React from 'react';
import Head from 'next/head';
import { PageSeo as PageSeoProps } from '../utils/NoteServerSideProps';

const PageSeo: React.FC<PageSeoProps> = ({ canonical, description, jsonLd, noindex }) => (
  <Head>
    {canonical && <link rel="canonical" href={canonical} />}
    {description && <meta name="description" content={description} />}
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
