---
type: "project_note"
id: "mining-heat-reuse-details"
title: "Reusing mining heat for heating"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["mining", "energy"]
aliases: ["Réutiliser la chaleur du minage pour chauffer"]
parent_ids: ["bitcoin-energy-debate", "asic-heat-reuse", "bitcoin-mining"]
related_ids: ["mining-curtailed-energy", "mining-methane-mitigation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://www.mara.com/posts/recycling-heat-from-data-centers-to-warm-a-community-in-finland", "https://www.energy.gov/energysaver/heat-pump-systems", "https://www.energy.gov.au/households/heating-and-cooling", "https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/87812.pdf", "https://offchain.media/article/orange-is-the-new-green/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Reusing mining heat for heating

## Questions covered

- Can an ASIC replace a radiator?
- Is it free or more efficient heating?
- How are the energy and emissions actually saved calculated?

## Short answer

Almost all of the electricity consumed by an ASIC ends up as heat. If that heat is recovered in the right place and at the right time, it can replace part of an existing heating system while the device takes part in mining. The value depends on the heating replaced, the useful heat and the full costs of the installation.

## Explanation

A device consuming 1 kW for 1 hour uses 1 kWh of electricity. At the scale of the room and excluding losses to the outside, this gives approximately 1 kWh of heat. The computation does not absorb a fraction of energy that would then disappear; the computing work and the heat dissipation are part of the same operation.

The heat can be recovered through the air or through a liquid circuit with a heat exchanger. To heat a building or water, a compatible temperature, pipes, regulation and sometimes additional equipment are needed. Not all the heat dissipated by the machines necessarily reaches the intended use.

An example announced by MARA in June 2024 is a 2 MW pilot in Finland connected to a district heating network serving about 11,000 residents. This does not mean that these miners alone cover all of their heating needs. The operator's announcement shows a concrete integration; the thermal output delivered and the fuel avoided are assessed with operating data.

The argument of *Orange is the New Green* takes a practical form here. Instead of venting all the heat of a computer, it is used for an existing need. Compared with a resistive electric radiator, mining revenue can reduce the net cost of heating, without automatically increasing its thermal efficiency.

## Limits and confusions

The comparison changes against a heat pump. A heat pump moves heat and can deliver several kWh of heat with 1 kWh of electricity, depending on conditions. An ASIC alone dissipates the electricity it consumes. The DOE describes this advantage of heat pumps; the same service delivered must therefore be compared, not just 2 electricity bills.

Fictional example, with no profitability forecast. An ASIC consumes 3 kWh and delivers 2.4 kWh of useful heat after system losses. A resistive radiator would need about 2.4 kWh for that service; a heat pump with a coefficient of performance of 3 would need about 0.8 kWh. Mining revenue can change the financial cost, but does not remove this difference in consumption.

The annual economic balance counts electricity, machines, the heat exchanger, auxiliaries and maintenance, then subtracts the heating actually avoided and the mining revenue. The latter varies; noise, availability and heat demand also determine whether the system suits the location.

In summer, producing heat with no outlet gives no heating savings. If air conditioning then has to remove it, it adds consumption. Seasonal reuse can still be useful, provided that seasonality is measured.

The carbon footprint is therefore neither automatically halved because the device provides 2 services, nor automatically zero. The gain depends on the equipment and fuels actually replaced, on the additional electricity and on the life cycle of the installations. The accounting allocation of emissions between mining and heating is a convention that must be made explicit.

## Further reading

- [[bitcoin-energy-debate.en|Bitcoin and energy — understanding costs and useful uses]].
- [[mining-curtailed-energy.en|When mining monetizes energy with no outlet]].
- [[mining-methane-mitigation.en|When mining can fund a reduction in methane emissions]].

## References

- [MARA, Finnish pilot announced on 20 June 2024](https://www.mara.com/posts/recycling-heat-from-data-centers-to-warm-a-community-in-finland), operator statement.
- [Australian government, resistive heating](https://www.energy.gov.au/households/heating-and-cooling).
- [DOE, how heat pumps work](https://www.energy.gov/energysaver/heat-pump-systems).
- [DOE, decarbonizing thermal systems](https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/87812.pdf).
- [Orange is the New Green, mining heat](https://offchain.media/article/orange-is-the-new-green/), editorial starting point.
