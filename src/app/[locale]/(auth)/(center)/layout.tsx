import { setRequestLocale } from 'next-intl/server';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-x-hidden px-4 py-6 sm:items-center sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,113,227,0.2)_0%,rgba(0,113,227,0)_72%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(42,169,255,0.16)_0%,rgba(42,169,255,0)_74%)]" />
      <div className="relative w-full max-w-5xl">
        {props.children}
      </div>
    </div>
  );
}
