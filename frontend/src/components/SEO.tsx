import React from "react";
import { Helmet } from "react-helmet-async";
import { useTenant } from "../providers/TenantProvider";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  path,
}) => {
  const { tenant } = useTenant();

  const siteName = tenant?.name || "o-229 Education";
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription =
    description ||
    tenant?.tagline ||
    "Plateforme SaaS de gestion scolaire intelligente et optimisée pour votre établissement.";
  const pageImage =
    image || tenant?.logoUrl || "https://o-229.com/og-image.jpg";
  const canonicalUrl = `https://${window.location.host}${path || window.location.pathname}`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
    </Helmet>
  );
};
