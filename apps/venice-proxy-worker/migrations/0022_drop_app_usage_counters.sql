-- Alice keeps no usage counter from the apps.
--
-- Up to 0.2.9 the apps counted, as daily totals, how often Alice and some of
-- its screens were opened and when a local model was downloaded. The apps no
-- longer send anything and the Worker discards what older versions still
-- post. This removes the totals already stored, so the table holds only the
-- clicks on the site's Download buttons.
DELETE FROM events_daily WHERE event_name <> 'site_download_clicked';
