import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, FileText, Mail, RefreshCw, XCircle } from 'lucide-react';
import { Fragment } from 'react';

type RefundPolicyProps = {
  supportEmail?: string;
  refundWindowDays?: number;
};

export const RefundPolicy = ({
  supportEmail = 'help@support.reverseimage.io',
  refundWindowDays = 14,
}: RefundPolicyProps) => {
  const sections: Array<{ title: string; icon: typeof FileText; color: string; body: Array<{ key: string; content: ReactNode }> }> = [
    {
      title: 'General policy',
      icon: FileText,
      color: 'indigo',
      body: [
        {
          key: 'non-refundable-credits',
          content: 'Credits are digital virtual content. Once a purchase is completed and credits are added to your balance, purchases are generally non-refundable.',
        },
        {
          key: 'waiver',
          content: 'By completing checkout, you expressly consent to immediate performance of the digital service and acknowledge that, where applicable, this may waive any statutory right of withdrawal (cooling-off period) for digital content.',
        },
      ],
    },
    {
      title: 'Exceptions & eligibility',
      icon: CheckCircle,
      color: 'emerald',
      body: [
        {
          key: 'unused-full-refund',
          content: `Unused full refund: If you purchase a credit pack and do not consume any of the purchased credits, you may request a full refund within ${refundWindowDays} days of the purchase date.`,
        },
        {
          key: 'technical-failures',
          content: 'Technical failures: If a credit is deducted but no results are delivered due to a system error and an automatic credit refund is not applied, you may request a correction (credit restoration) or a refund for the affected search.',
        },
        {
          key: 'duplicate-charges',
          content: 'Duplicate charges: If you are charged more than once for the same order due to a payment processing issue, we will refund the duplicate charge(s).',
        },
      ],
    },
    {
      title: 'Non-refundable scenarios',
      icon: XCircle,
      color: 'red',
      body: [
        {
          key: 'unsatisfactory-results',
          content: 'Unsatisfactory results: Search results depend on third-party indexing (e.g., Google/SerpApi). Not finding an expected match or receiving low-similarity results is not a refund reason.',
        },
        {
          key: 'account-violations',
          content: 'Account violations: If your account is suspended for violating the Terms (e.g., abuse, scraping, reverse engineering), remaining credits are not refundable.',
        },
        {
          key: 'partially-consumed',
          content: 'Partially consumed credits: If any credits from a purchased pack have been used (even 1 credit), the pack is considered activated and is not eligible for a full refund.',
        },
      ],
    },
    {
      title: 'Refund process',
      icon: RefreshCw,
      color: 'purple',
      body: [
        {
          key: 'contact-email',
          content: (
            <Fragment key="contact-email">
              Contact us at
              {' '}
              <a className="font-semibold text-[var(--ui-accent)] hover:underline" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              .
            </Fragment>
          ),
        },
        {
          key: 'required-info',
          content: 'Include the email address on your account, the Stripe transaction identifier (e.g., Checkout Session ID or receipt), the reason for the request, and any relevant screenshots.',
        },
        {
          key: 'timing',
          content: 'We typically review and respond within 3–5 business days. Refund settlement time depends on your bank (commonly 5–10 business days).',
        },
      ],
    },
    {
      title: 'Legal & compliance notes',
      icon: AlertTriangle,
      color: 'amber',
      body: [
        {
          key: 'currency',
          content: 'Refunds are issued to the original payment method and in the original payment currency. We are not responsible for foreign exchange differences or bank fees.',
        },
        {
          key: 'local-law',
          content: 'If mandatory local law requires different treatment, we will comply with the applicable legal requirements.',
        },
      ],
    },
  ] as const;

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: 'bg-sky-100 text-[var(--ui-accent)]',
      emerald: 'bg-sky-100 text-[var(--ui-accent)]',
      red: 'bg-sky-100 text-[var(--ui-accent)]',
      purple: 'bg-sky-100 text-[var(--ui-accent)]',
      amber: 'bg-sky-100 text-[var(--ui-accent)]',
    };
    return colors[color as keyof typeof colors] || colors.indigo;
  };

  return (
    <div className="ui-page">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <div
            key={section.title}
            className="ui-panel group p-5 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className={`ui-icon-box ui-icon-box-sm shrink-0 ${getColorClasses(section.color)}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--ui-ink)] sm:text-xl">{section.title}</h3>
                <div className="mt-2 space-y-2 text-xs leading-relaxed text-[var(--ui-muted)] sm:mt-3 sm:space-y-3 sm:text-sm">
                  {section.body.map(paragraph => (
                    <p key={paragraph.key} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ui-accent)]" />
                      <span className="flex-1">{paragraph.content}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Contact Section */}
      <div className="ui-panel-soft p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="ui-icon-box ui-icon-box-sm shrink-0 bg-[var(--ui-accent)] text-white">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-[var(--ui-ink)] sm:text-lg">Need help with a refund?</h4>
            <p className="mt-1.5 text-xs text-[var(--ui-muted)] sm:mt-2 sm:text-sm">
              Contact us at
              {' '}
              <a className="font-semibold text-[var(--ui-accent)] hover:underline active:underline" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              {' '}
              with your transaction details and we'll respond within 3-5 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
