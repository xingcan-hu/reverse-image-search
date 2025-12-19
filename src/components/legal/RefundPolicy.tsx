import type { ReactNode } from 'react';
import { Fragment } from 'react';

type RefundPolicyProps = {
  supportEmail?: string;
  refundWindowDays?: number;
};

export const RefundPolicy = ({
  supportEmail = 'help@support.reverseimage.io',
  refundWindowDays = 14,
}: RefundPolicyProps) => {
  const sections: Array<{ title: string; body: Array<{ key: string; content: ReactNode }> }> = [
    {
      title: 'General policy',
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
      body: [
        {
          key: 'contact-email',
          content: (
            <Fragment key="contact-email">
              Contact us at
              {' '}
              <a className="font-semibold text-indigo-600 hover:underline" href={`mailto:${supportEmail}`}>
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

  return (
    <div className="space-y-3">
      {sections.map(section => (
        <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            {section.body.map(paragraph => (
              <p key={paragraph.key}>{paragraph.content}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
