// Home FAQ. Answers the common objections and feeds a FAQPage schema, which
// helps AI answer engines (Google AI Overviews, ChatGPT, Perplexity) cite Alice.

const FAQS: { q: string; a: string; link?: { label: string; href: string } }[] = [
  {
    q: 'Is Alice really private?',
    a: 'Yes. The Local model runs on your device in the installed app; other features, such as downloads and the Explorer, use the network. Private Cloud encrypts your messages end-to-end to confidential hardware; the exact program inside cannot be verified yet, pending Venice’s reference values. The trust page says what is verified today.',
  },
  {
    q: 'Can Alice spend or move my Bitcoin?',
    a: 'No. Alice is self-custodial: your keys stay on your device and the AI never holds them. The AI and the wallet are separate code, by construction: inside the app, the Playground is its own wallet with nothing shared with the model. The wallet, not the model, validates and signs, so a prompt can never move your funds.',
  },
  {
    q: 'Do you track me?',
    a: 'No. No cookies, no ad trackers, no fingerprinting, no selling data. Private Cloud messages are end-to-end encrypted: we cannot read them or count their tokens, and usage is estimated from the volume of encrypted bytes. At most, cookieless aggregate page-view counts elsewhere, nothing that identifies you.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, the app is free and self-custodial, and Alice Local answers without limits. A plan buys exactly one thing: capacity on the larger Private Cloud model hosted in the cloud, nothing else. Alice is still a beta.',
  },
  {
    q: 'Is Alice on mainnet?',
    a: 'Not with real funds. The Playground inside Alice App only ever uses Mutinynet test coins, nothing there is real money. The Explorer reads the real chain. Private Cloud’s own end-to-end verification is still being completed, and the trust page says exactly what is proven today.',
  },
  {
    q: 'What is Mutinynet?',
    a: 'A Bitcoin test network, run independently of Alice. The Playground in Alice App runs on it with free test coins, so you can practice sending and receiving safely before touching real sats.',
    link: { label: 'mutinynet.com', href: 'https://mutinynet.com' },
  },
  {
    q: 'Is Alice open source?',
    a: 'Yes. The source, release tags, installer checksums, and security model are public, so anyone can inspect the code and check that a downloaded file is the one we published. Builds are not yet reproducible byte for byte, so that check proves the file, not yet how it was built.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="text-3xl font-semibold sm:text-4xl">Questions people ask</h2>
      <dl className="mt-8 divide-y divide-[var(--alice-border)]">
        {FAQS.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="text-lg font-semibold text-[var(--alice-heading)]">{f.q}</dt>
            <dd className="mt-2 leading-relaxed text-[var(--alice-text)]">
              {f.a}
              {f.link && (
                <>
                  {' '}
                  <a
                    href={f.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--alice-primary)] hover:underline"
                  >
                    {f.link.label} →
                  </a>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
