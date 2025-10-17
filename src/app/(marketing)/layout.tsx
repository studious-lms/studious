import "../branding.css"; // Use branding.css for landing pages

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-theme">
      {children}
    </div>
  );
}

