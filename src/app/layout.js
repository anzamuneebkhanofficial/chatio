import './globals.css';

export const metadata = {
  title: 'Muhammad Anza Muneeb Khan — Full-Stack Developer',
  description:
    'Personal portfolio of Muhammad Anza Muneeb Khan — Full-Stack Engineer specializing in MERN Stack, Next.js, WordPress, and Shopify development.',
  keywords: [
    'Full-Stack Developer',
    'MERN Stack',
    'Next.js',
    'React',
    'WordPress',
    'Shopify',
    'Web Development',
    'Lahore Pakistan',
  ],
  authors: [{ name: 'Muhammad Anza Muneeb Khan' }],
  openGraph: {
    title: 'Muhammad Anza Muneeb Khan — Full-Stack Developer',
    description: 'Full-Stack Engineer & BS IT Student based in Lahore, Pakistan.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
