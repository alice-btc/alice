import { SvgIcon } from '@/components/SvgIcon';
import { BACK_ICON } from '@/lib/atelier-icons';
export const metadata = {
  title: 'Alice Web and Account Privacy Notice',
  description: 'How Alice Web stores local data and uses account and external services.',
};

const sectionStyle: React.CSSProperties = {
  borderTop: '1px solid var(--alice-border)',
  paddingTop: 24,
  marginTop: 32,
};

export default function PrivacyPage() {
  return (
    <main
      className="font-numbers"
      style={{
        width: 'min(100% - 32px, 760px)',
        margin: '0 auto',
        padding: '48px 0 72px',
        color: 'var(--alice-text)',
      }}
    >
      <a
        href="/"
        className="alice-control alice-control--quiet"
        style={{ textDecoration: 'none' }}
      >
        <SvgIcon svg={BACK_ICON} size={20} /> Back to Alice
      </a>

      <h1
        className="font-pixel"
        style={{
          margin: '40px 0 16px',
          color: 'var(--alice-primary)',
          fontSize: 18,
          lineHeight: '30px',
          letterSpacing: 0,
        }}
      >
        ALICE WEB AND ACCOUNT PRIVACY
      </h1>
      <p style={{ color: 'var(--alice-muted)', fontSize: 16, lineHeight: '24px' }}>
        Updated 23 October 2026. This notice covers Alice Web, the optional Alice
        account and Private Cloud. Local AI does not require you to sign in.
      </p>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          DATA ALICE USES
        </h2>
        <ul style={{ paddingLeft: 22, fontSize: 17, lineHeight: '26px' }}>
          <li>Your email address is processed to deliver a one-time login code.</li>
          <li>
            A masked email label and an opaque HMAC lookup are stored with your
            account. The lookup is what signs you in, and it cannot be reversed
            into an address.
          </li>
          <li>
            Your email address is also stored, encrypted, so that Alice can warn
            you before a paid plan runs out. Bitcoin payments cannot renew a
            plan on their own, so without a way to reach you a plan would simply
            lapse in silence. The encryption protects the address if the
            database or a backup leaks. It does not hide it from Alice, whose
            server decrypts it to send. An alias is a perfectly good address to
            use.
          </li>
          <li>
            Alice writes to you unasked about a plan that is about to end, three
            days before and on the day, and a few times a year about what Alice
            can now do. Nothing else: no marketing, no partners.
          </li>
          <li>
            Alice stores your chosen display name, unique username and a salted,
            one-way password hash when you enable password login. Alice never stores
            the password itself.
          </li>
          <li>
            A random installation ID is stored as an HMAC, never as a hardware
            fingerprint.
          </li>
          <li>
            Your IP address is converted in memory into a short-lived HMAC bucket.
            The raw IP is not stored in the Alice account database.
          </li>
          <li>
            Session token hashes, quota counters and a request ledger prevent replay
            and double spending of free requests.
          </li>
          <li>
            A random internal user ID links the login methods you explicitly add to
            the same Alice account.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          DATA OUTSIDE THE ACCOUNT
        </h2>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          The account service does not receive your plaintext conversations.
          Explorer lookups are separate network requests, described below.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Private Cloud messages are end-to-end encrypted: they are encrypted on
          your device and pass through the Alice proxy, which cannot decrypt
          them. Venice does not yet provide everything needed to verify the full
          chain, see below; Alice keeps this setup until a better solution is
          available. The account ledger records technical request state, not
          conversation content.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          BROWSER STORAGE
        </h2>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Alice Web encrypts saved conversations, memory, learning profile and
          managed Explorer and Playground records with a key stored in this
          browser. When encryption is unavailable, new managed data is not saved
          in plaintext. Storage failures may prevent saving or reopening history.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          This automatic encryption does not lock Alice. Someone using your
          browser, or malicious code running within Alice, may still access the
          data. The key cannot be exported through the normal browser crypto API,
          but protection against copying an entire browser profile is not assured.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Account session tokens, Custom AI settings including any API key, your
          Instructions for Alice, Learn reading progress and some preferences
          remain outside this encryption. The Explorer cache
          also stores consulted addresses and public results without this
          encryption. Clearing browser data can permanently remove local history.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          EXTERNAL REQUESTS AND USAGE COUNTERS
        </h2>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Explorer sends lookups to the selected network service, such as
          mempool.space, Blockstream or a custom node. Address label lookups also
          send the viewed addresses to Alice&apos;s Worker. These services receive
          the queried public blockchain data and network request metadata.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Alice sends predefined usage events, such as opening Chat or Settings,
          with session authentication, an installation identifier, platform and
          app version. A session may be created without signing in. The server
          stores daily totals by event, platform and version, without attaching
          an account or session identifier to those totals. Event payloads do
          not contain your message text.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Learn resources and optional semantic search downloads contact their
          hosting services, including jsDelivr and Hugging Face. Custom AI sends
          messages to the server you configure, under that server&apos;s privacy
          policy.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Screens that display bitcoin amounts fetch the current bitcoin price
          from Coinbase for fiat conversion. Requesting test sats in Playground sends its test-network
          address, its first receive address and the installation identifier to
          Alice&apos;s Worker, which keeps only a one-way HMAC of the claimant and
          the claim time.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          RETENTION
        </h2>
        <ul style={{ paddingLeft: 22, fontSize: 17, lineHeight: '26px' }}>
          <li>
            Login codes expire after 10 minutes and expired challenges are purged
            hourly.
          </li>
          <li>
            Email verification codes expire after 10 minutes, cannot be reused, and
            are limited to five attempts.
          </li>
          <li>
            Anti-abuse buckets expire after their 1-hour or 24-hour window and are
            purged hourly.
          </li>
          <li>
            Refresh sessions expire after 30 days. Expired and revoked sessions are
            removed after a short security retention period.
          </li>
          <li>
            Quota counters and the request ledger remain while needed to protect
            account integrity and resolve quota disputes.
          </li>
          <li>
            The stable email lookup, the masked label and the encrypted address
            remain until the account is deleted, and are removed with it.
          </li>
          <li>
            The hashed installation grant may be retained after account deletion
            solely to prevent the same installation from repeatedly claiming the
            lifetime free allowance.
          </li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          PROCESSORS
        </h2>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Cloudflare runs the Alice Worker at its network edge and the European D1
          account database. As the network processor, Cloudflare receives request
          metadata such as IP address and headers in transit. Alice disables
          Cloudflare&apos;s automatic invocation logs and emits only body-free technical
          events without IP addresses, tokens or login credentials.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Resend receives your email address and one-time-code message to deliver
          login email from its European sending region. Resend states that account,
          API and log metadata are stored in the United States and that standard
          email data retention is 30 days.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Venice processes Private Cloud messages inside a hardware enclave.
          Alice implements end-to-end encryption as described in Venice&apos;s
          documentation and verifies the enclave&apos;s Intel attestation before
          every message. The GPU attestation is not checked yet. Verifying the
          exact software inside requires reference values that Venice has not
          published yet; we are waiting for them from Venice. Until then, Alice
          does not display &quot;E2EE verified&quot;.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Alice does not use advertising identifiers, canvas fingerprints or wallet
          data to enforce the free quota.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 className="font-pixel" style={{ fontSize: 10, lineHeight: '20px' }}>
          CONTROL AND DELETION
        </h2>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          You can sign out or request account deletion from the Alice account panel.
          A deletion request revokes active sessions immediately. During the beta,
          final deletion may be completed manually.
        </p>
        <p style={{ fontSize: 17, lineHeight: '26px' }}>
          Privacy questions and deletion follow-up can be sent to{' '}
          <a href="mailto:contact@alicebtc.com" style={{ color: 'var(--alice-primary)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            contact@alicebtc.com
          </a>.
        </p>
      </section>
    </main>
  );
}
