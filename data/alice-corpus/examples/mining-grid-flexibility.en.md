---
type: "project_note"
id: "mining-grid-flexibility"
title: "How miners can help balance a power grid"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["mining", "energy"]
aliases: ["Comment les mineurs peuvent aider à équilibrer un réseau électrique"]
parent_ids: ["bitcoin-energy-debate", "bitcoin-mining"]
related_ids: ["mining-curtailed-energy", "mining-renewable-projects"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://www.ercot.com/news/release/2022-12-06-ercot-creates-voluntary", "https://www.ercot.com/files/docs/2023/03/27/December-2022-Cold-Weather-Operations-Public-Report.pdf", "https://www.ercot.com/services/programs/load", "https://www.ercot.com/files/docs/2024/11/01/MORA_January2025.pdf", "https://www.iea.org/reports/electricity-2026/flexibility", "https://pmc.ncbi.nlm.nih.gov/articles/PMC13634397/", "https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# How miners can help balance a power grid

## Questions covered

- How can shutting down miners help the grid?
- What was actually observed in Texas?
- Is a mine a reserve of electricity?

## Short answer

A controllable mine can quickly reduce its consumption when electricity is scarce or becomes expensive. This drop in demand leaves power available for other uses. For the grid operator, its value depends on the response actually delivered, on the miner's commitments and on local constraints.

## Explanation

The grid must balance production and consumption. A mining farm can interrupt part of its machines and temporarily forgo revenue. It does not necessarily have the same continuity constraints as a hospital or an industrial process that would lose its output by stopping. It is this ability to modulate, highlighted by Alexandre Stachtchenko, that makes it possible to provide an energy service.

Several mechanisms coexist. The miner can stop voluntarily because the electricity price exceeds its expected revenue. It can also respond to a request from the operator, or take part in a paid service after qualification. ERCOT notably distinguishes price responses, emergency services and ancillary services. These commitments have neither the same obligations nor the same payment terms.

One observed result illustrates this flexibility. During the winter storm of December 2022, ERCOT reports that the registered large flexible loads reduced their consumption from 1,530 to 130 MW at peak demand, that is 91.5%. This group includes Bitcoin mining facilities and other data centers. The figure must therefore not be attributed entirely to Bitcoin. The program announced by ERCOT on 6 December 2022 was voluntary; it does not by itself describe the rules of all current contracts.

A mine that consumed 10 MW and drops to 1 MW reduces demand by 9 MW. It does not inject an additional 9 MW into the grid. To know whether its presence improves the system over the year, one also has to examine the periods when it runs, its grid connection and the production capacity it calls on.

## Limits and confusions

The technical ability to stop does not prove that the miner will stop at the right time. An ERCOT forecast for January 2025 modeled shutdowns based on the power price and mining revenue, with a residual consumption for auxiliaries. This is an economic planning assumption, not a universal physical guarantee.

To assess a real service, one looks for a baseline load, timestamped measurements, a command or a price signal, a curtailment duration and the conditions for resuming. The reduction must happen in the right place; shutting down a mine behind another grid constraint can provide a different service.

The IEA also describes the contribution of batteries, other flexible loads and grids. Mining can complement these resources. Its participation does not automatically demonstrate a lower bill for residents or lower emissions; those results require a comparison with the system without that mine.

An econometric study by Gill, Stinner and Tyrell published in September 2026 on Texas between 2021 and 2024 finds an effect on local nighttime wholesale prices and does not observe the same flexibility in ordinary cycles as during extreme shortages. This local result does not directly measure household bills and does not contradict the curtailment observed during the 2022 storm. It invites checking the usual behavior, in addition to crisis days.

## Further reading

- [[mining-curtailed-energy.en|When mining monetizes energy with no outlet]].
- [[mining-renewable-projects.en|How mining can support a renewable project]].
- [[bitcoin-energy-debate.en|Bitcoin and energy — understanding costs and useful uses]].

## References

- [ERCOT, voluntary program of December 2022](https://www.ercot.com/news/release/2022-12-06-ercot-creates-voluntary).
- [ERCOT, report on the December 2022 storm, printed p. 24](https://www.ercot.com/files/docs/2023/03/27/December-2022-Cold-Weather-Operations-Public-Report.pdf).
- [ERCOT, demand response categories](https://www.ercot.com/services/programs/load).
- [ERCOT, load assumptions for January 2025](https://www.ercot.com/files/docs/2024/11/01/MORA_January2025.pdf).
- [Gill, Stinner and Tyrell, iScience, 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13634397/), local study of wholesale prices.
- [IEA, flexibility, Electricity 2026](https://www.iea.org/reports/electricity-2026/flexibility).
- [Alexandre Stachtchenko, 2023 argument](https://medium.com/@AlexStach/bitcoin-une-solution-contre-intuitive-au-changement-climatique-668364b0c205).
