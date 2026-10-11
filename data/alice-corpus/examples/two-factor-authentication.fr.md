---
type: "project_note"
id: "two-factor-authentication"
title: "La double authentification"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Two-Factor Authentication"]
parent_ids: []
related_ids: ["sim-swap", "password-manager", "phishing-and-social-engineering", "secondary-bitcoin-btcpay-security", "secondary-bitcoin-lnurl-auth", "secondary-privacy-passkeys", "secondary-privacy-secure-email-account", "secondary-privacy-single-sign-on-risk", "secondary-privacy-totp"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB Extraction — 2026-05-23 — scu101"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La double authentification

## Questions couvertes

- Que protège le second facteur d’un compte ?

## Réponse courte

La double authentification demande une preuve supplémentaire au-delà du mot de passe. Elle protège l’accès à un compte ; elle ne modifie pas les conditions de dépense des bitcoins du protocole.

## Explication

Les formes courantes comprennent les codes d’application, les SMS et les clés matérielles d’authentification. Leurs résistances diffèrent, notamment face au vol d’un numéro et aux faux sites. Les moyens de secours méritent aussi une protection, car ils peuvent permettre de contourner le facteur habituel.

Il faut examiner le parcours de récupération du compte autant que la connexion quotidienne. Un email vulnérable ou un numéro détourné peut rester un point faible selon le service.

## Limites et confusions

Une phrase de récupération Bitcoin divulguée ne devient pas protégée par la double authentification du compte associé. Une clé matérielle d’authentification et un hardware wallet de signature n’ont pas nécessairement la même fonction. Les codes temporaires peuvent être demandés par un faux support ; leur caractère temporaire ne rend pas leur transmission sûre.

## Approfondissements

- [[sim-swap.fr|Le détournement de carte SIM]].
- [[password-manager.fr|Les gestionnaires de mots de passe]].
- [[phishing-and-social-engineering.fr|Les faux supports et le phishing]].

- [[secondary-bitcoin-btcpay-security.fr|Sécuriser une installation BTCPay]].
- [[secondary-bitcoin-lnurl-auth.fr|S’authentifier avec LNURL-AUTH]].
- [[secondary-privacy-passkeys.fr|Les passkeys et leur récupération]].
- [[secondary-privacy-secure-email-account.fr|Le rôle de l’email dans la récupération des comptes]].
- [[secondary-privacy-single-sign-on-risk.fr|La dépendance à une connexion centralisée]].
- [[secondary-privacy-totp.fr|Les codes d’authentification TOTP]].

## Références

- PlanB scu202 — Improve Your Personal Digital Security.
- PlanB Extraction — 2026-05-23 — scu101.
