# IDA Scorecard — Project Context for Claude Code

Complete reference for all 52 XLSX data files and 50 PDF methodology notes in this
project. Read before writing any query, pandas filter, or component. Every file is
listed; every schema difference is documented.

---

## 1. What this project is

The **WBG Corporate Scorecard FY24–FY30** tracks World Bank Group results across
three pillars:

| Pillar | Description |
|--------|-------------|
| **Vision** | Global development trends — not attributable to WBG |
| **Client Context** | Country-level conditions in WBG borrower countries |
| **Results** | Direct beneficiaries of IBRD, IDA, IFC, MIGA operations |

This codebase builds the **IDA Scorecard** surfacing results for IDA-eligible
countries (~75 of the world's poorest), with lenses for FCS (Fragility, Conflict &
Violence), LDCs, and Small States/SIDS.

**Scorecard period:** FY24–FY30 (Board-endorsed Dec 19, 2023)
**Current reporting year:** FY25 (ends June 30, 2025)

---

## 2. Scorecard verticals (FY25 achievement ratios)

| Vertical | FY25 ratio |
|----------|-----------|
| People | 68% |
| Prosperity | 52% |
| Planet | 45% |
| Infrastructure | 41% |
| Digital | 50% |

---

## 3. CRITICAL — Two distinct XLSX schemas

Never mix these. Results files and Context/Vision files have completely different columns.

### Schema A — Results files (CSC_RES_*.xlsx)

Four sheets: Aggregates / WB Project Information / IFC MIGA Results / Dictionary

**Aggregates columns:**
```
Indicator_Code, Indicator_Name, Sub_Indicator_Code
Organization_Code           # WBG | WB | IDA | IBRD | IFC | MIGA
Indicator_Type              # always "WBG Results"
Geography_Type              # GLOBAL | REGION | COUNTRY | INCOME_GROUP | SMALLSTATE
Geography_Code, Geography_Name
Demographic_Disaggregation  # Total | Female | Youth | Yes (disability)
Time_Period                 # YYYY-MM-DD  e.g. 2025-06-30
Unit_Measure                # Beneficiaries | USD | GW | Hectares | Percentage
Achieved_Results            # <- key data column
Expected_Results            # <- key data column
Disability_Inclusive_Flag, Observation_Note
```

**WB Project Information columns (56 total, key ones):**
```
Project_ID, Project_Name, Approval_Date, Closing_Date
WB_Region, CountryEconomy_Code, CountryEconomy_Name
Lending_Instrument, Project_Financier, Agreement_Type
Net_Commitment_Total, Net_Commitment_IBRD, Net_Commitment_IDA, Net_Commitment_Others
indicator_code, sub_indicator_code, Reporting_FY
Achieved_Results, Expected_Results
Achieved_Results_IDA, Expected_Results_IDA
Achieved_Results_IBRD, Expected_Results_IBRD
Demographic_Disaggregation
Double_Counting_Flag        # Y | N — exclude Y when summing across indicators
FCV_Flag                    # Y | N — primary FCS filter
Small_State_Flag, SIDS_Flag, LDC_Flag
Income_Group                # LIC | LMC | UMC | HIC
```

**IFC MIGA Results:** aggregate only — no project rows (data privacy policy).

---

### Schema B — Context & Vision files (all other XLSX)

Two sheets only: Aggregates / Dictionary

```
Indicator_Code, Indicator_Name
Indicator_Type              # "Client Context" or "Vision"
Geography_Type              # ECONOMY | REGION | FCS | INCOME | SIDS | LDC | SMALLSTATE
                            # NOTE: country rows use ECONOMY not COUNTRY
Geography_Code, Geography_Name
Time_Period                 # year as integer or date — varies by file
Unit_Multiplier, Unit_Measure_Code, Unit_Measure_Name
Value                       # <- THE data column (no Achieved/Expected split)
Observation_Status_Code     # A = normal value
Observation_Status_Name, Observation_Note
```

**Key differences from Schema A:**
- `Value` not `Achieved_Results` / `Expected_Results`
- No `Organization_Code` or `Demographic_Disaggregation`
- Country-level rows: `Geography_Type == 'ECONOMY'` not `'COUNTRY'`
- No project-level sheet
- Multi-year time series panel

---

## 4. Complete XLSX inventory (52 files)

### Results files — Schema A (21 files)

| File | Indicator Code | Name | Vertical |
|------|---------------|------|----------|
| `CSC_RES_SOC_SAF_PROG.xlsx` | `CSC_RES_SOC_SAF_PROG` | Social safety net beneficiaries | People |
| `CSC_RES_EDU_SUPP.xlsx` | `CSC_RES_EDU_SUPP` | Students supported with better education | People |
| `CSC_RES_HEA_SERV.xlsx` | `CSC_RES_HEA_SERV` | People receiving quality HNP services | People |
| `CSC_RES_HEA_EMER_BENE.xlsx` | `CSC_RES_HEA_EMER_BENE` | Economies with strengthened health emergency capacity | People |
| `CSC_RES_DEBT_SUST_RISK.xlsx` | `CSC_RES_DEBT_SUST_RISK` | Economies implementing debt sustainability reforms | Prosperity |
| `CSC_RES_TAX_REV_GDP.xlsx` | `CSC_RES_TAX_REV_GDP` | Economies below 15% tax-to-GDP with increased collections | Prosperity |
| `CSC_RES_GHG_EMS_YEAR.xlsx` | `CSC_RES_GHG_EMS_YEAR` | Net GHG emissions from WBG portfolio | Planet |
| `CSC_RES_RESI_CLIM_RISK.xlsx` | `CSC_RES_RESI_CLIM_RISK` | Beneficiaries with enhanced climate resilience | Planet |
| `CSC_RES_TER_AQU_HECT.xlsx` | `CSC_RES_TER_AQU_HECT` | Hectares under enhanced conservation/management | Planet |
| `CSC_RES_WAT_SAN_HYG_TOT.xlsx` | `CSC_RES_WAT_SAN_HYG_TOT` | People with WASH services + safely managed sub-indicator | Planet |
| `CSC_RES_FOOD_NUTR_SECU.xlsx` | `CSC_RES_FOOD_NUTR_SECU` | People with strengthened food & nutrition security | Planet |
| `CSC_RES_ACCS_TRANS_INFRA_SERV.xlsx` | `CSC_RES_ACCS_TRANS_INFRA_SERV` | People benefiting from sustainable transport | Infrastructure |
| `CSC_RES_ELC_ACCS.xlsx` | `CSC_RES_ELC_ACCS` | People provided with electricity access | Infrastructure |
| `CSC_RES_REN_ENER_ENAB.xlsx` | `CSC_RES_REN_ENER_ENAB` | GW of renewable energy capacity enabled | Infrastructure |
| `CSC_RES_BRO_INTE.xlsx` | `CSC_RES_BRO_INTE` | People using broadband internet | Digital |
| `CSC_RES_DIG_ENA_SERV.xlsx` | `CSC_RES_DIG_ENA_SERV` | People using digitally enabled services | Digital |
| `CSC_RES_GEN_EQU_BENE.xlsx` | `CSC_RES_GEN_EQU_BENE` | People benefiting from gender equality actions | Cross-cutting |
| `CSC_RES_FIN_SERV_WOM.xlsx` | `CSC_RES_FIN_SERV_WOM` | People/businesses using financial services incl. women | Cross-cutting |
| `CSC_RES_DISP_COMM_SERVICES.xlsx` | `CSC_RES_DISP_COMM_SERVICES` | Displaced people & host communities with services | Cross-cutting |
| `CSC_RES_PRIV_CAP_MOBL.xlsx` | `CSC_RES_PRIV_CAP_MOBL` | Total private capital mobilized (USD) | Cross-cutting |
| `CSC_RES_PRIV_CAP_ENAB.xlsx` | `CSC_RES_PRIV_CAP_ENAB` | Total private capital enabled (USD) | Cross-cutting |

Note: `CSC_RES_ELC_ACCS.xlsx` has extra sheets — Direct Access, Inferred & Improved Input,
Inferred & Improved Output — feeding the Multi-Tier Framework energy access model.

---

### Context files — Schema B (22 files)

| File | Indicator Code(s) | Name | Outcome Area |
|------|------------------|------|--------------|
| `SE_LPV_PRIM.xlsx` | `SE_LPV_PRIM` | Learning poverty | 2 |
| `SH_STA_STNT_ME_ZS.xlsx` | `SH_STA_STNT_ME_ZS` | Stunting (% under 5) | 3 |
| `SH_UHC_SRVS_CV_XD.xlsx` | `SH_UHC_SRVS_CV_XD` | UHC coverage index (0–100) | 3 |
| `FI_DEB_RISK.xlsx` | `FI_DEB_RISK` | Countries in/at high risk of debt distress | 4 |
| `FI_TAX_GD_ZS.xlsx` | `FI_TAX_GD_ZS` | Countries with tax-to-GDP ≤ 15% | 4 |
| `EN_ATM_HAZA.xlsx` | `EN_ATM_HAZA` | % population in hazardous air quality | 5 |
| `ER_NCA_RNEW.xlsx` | `ER_NCA_RNEW` | Countries with increasing renewable natural capital | 5 |
| `EN_FSH_SUST_ZS.xlsx` | `EN_FSH_SUST_ZS` | Fish stocks within sustainable levels (%) | 5 |
| `ER_PTD_TOTL_ZS.xlsx` | `ER_PTD_TOTL_ZS` | % terrestrial/aquatic areas protected | 5 |
| `SH_H2O_STA_HYGN_ZS_TO.xlsx` | `SH_H2O_STA_HYGN_ZS_TO` | % people with basic WASH **(Client Context)** | 6 |
| `SN_ITK_MSFI_ZS_CC.xlsx` | `SN_ITK_MSFI_ZS_CC` | % people facing food insecurity **(Client Context)** | 7 |
| `SP_ROD_R2KM.xlsx` | `SP_ROD_R2KM` | % people with reliable transport year-round | 8 |
| `EG_ELC_ACCS_ZS.xlsx` | `EG_ELC_ACCS_ZS` | % population with electricity access | 9 |
| `IT_NET_USER_ZS.xlsx` | `IT_NET_USER_ZS` | % population using the internet | 10 |
| `IT_GOV_EGOV_XQ.xlsx` | `IT_GOV_EGOV_XQ` | e-Government service index (0–1) | 11 |
| `FX_OWN_TO.xlsx` | `FX_OWN_TO` | % population with financial account (incl. women) | 12 |
| `SL_EMP_WORK_TO.xlsx` | `SL_EMP_WORK_TO` | Wage & salaried workers (% employment) | 13/14 |
| `SL_UEM_NEET_ME_TO.xlsx` | `SL_UEM_NEET_ME_TO` | Youth NEET rate | 13/14 |
| `SM_POP_FDIP.xlsx` | `SM_POP_FDIP` | Number of forcibly displaced people | 13 |
| `CSC_CLI_EXT_POOR_FCS.xlsx` | `CSC_CLI_EXT_POOR_FCS` | % FCS population in extreme poverty ($3/day) | 13/14 |
| `NE_GDI_FPRV_ZS.xlsx` | `NE_GDI_FPRV_ZS` | Private investment as % of GDP | 15 |
| `PER_ALLSP_COV_POP_TO.xlsx` | `PER_ALLSP_COV_POP_TOT` / `PER_ALLSP_COV_Q1_TOT` | % population covered by social protection (total + poorest quintile) | 1 |

**WARNING — `PER_ALLSP_COV_POP_TO.xlsx`:**
- Filename stem does NOT match the indicator codes inside
- Contains two sub-indicators: `PER_ALLSP_COV_POT_TOT` (all) and `PER_ALLSP_COV_Q1_TOT` (poorest quintile)
- Filter by `Indicator_Code` to separate them

---

### Vision files — Schema B (8 files)

| File | Indicator Code(s) | Name |
|------|------------------|------|
| `SI_POV_DDAY_TO.xlsx` | `SI_POV_DDAY` / `SI_POV_UMIC` | Global poverty at $3/day and $8.30/day |
| `SI_POV_PROS.xlsx` | `SI_POV_PROS` | Prosperity gap (shortfall from $28/day) |
| `SI_DST_INEQ.xlsx` | `SI_DST_INEQ` | Countries with high inequality (Gini > 40) |
| `SN_ITK_MSFI_ZS.xlsx` | `SN_ITK_MSFI_ZS` | % people facing food insecurity **(Vision / global)** |
| `SH_H2O_STA_HYGN_TO.xlsx` | `SH_H2O_STA_HYGN_TO` | % population with basic WASH **(Vision / global)** |
| `EN_ATM_GHGT_GT_CE.xlsx` | `EN_ATM_GHGT_GT_CE` | Greenhouse gas emissions (MtCO2eq/yr) |
| `EN_CLM_VULN.xlsx` | `EN_CLM_VULN` | % people at high risk from climate hazards |
| `ER_LND_HEAL.xlsx` | `ER_LND_HEAL` | Hectares of key ecosystems globally |

**WARNING — two nearly identical pairs:**
- Food insecurity: `SN_ITK_MSFI_ZS.xlsx` (Vision) vs `SN_ITK_MSFI_ZS_CC.xlsx` (Client Context)
- WASH: `SH_H2O_STA_HYGN_TO.xlsx` (Vision) vs `SH_H2O_STA_HYGN_ZS_TO.xlsx` (Client Context)
Always check `Indicator_Type` column before using.

---

### Metadata file (1 file)

| File | Contents |
|------|----------|
| `IDA_Scorecard_Metadata_1.xlsx` | Master catalogue: all codes, names, definitions, verticals, outcome areas, methodology URLs. Sheet name: `Result`. Single source of truth. |

---

## 5. Complete PDF inventory (50 files)

### Outcome Area 1 — Protection for the Poorest
| File | Covers |
|------|--------|
| `1_1_RESULTS_Social_Safety_Nets.pdf` | `CSC_RES_SOC_SAF_PROG` |
| `1_1_CONTEXT_Social_Protection.pdf` | `PER_ALLSP_COV_POP_TO` |

### Outcome Area 2 — No Learning Poverty
| File | Covers |
|------|--------|
| `2_1_RESULTS_Better_Education.pdf` | `CSC_RES_EDU_SUPP` |
| `2_1_CONTEXT_Learning_Poverty.pdf` | `SE_LPV_PRIM` |

### Outcome Area 3 — Healthier Lives
| File | Covers |
|------|--------|
| `3_1_RESULTS_HNP_Services.pdf` | `CSC_RES_HEA_SERV` |
| `3_2_RESULTS_Health_Emergencies.pdf` | `CSC_RES_HEA_EMER_BENE` |
| `3_1_CONTEXT_Stunting.pdf` | `SH_STA_STNT_ME_ZS` |
| `3_2_CONTEXT_Universal_Health_Coverage.pdf` | `SH_UHC_SRVS_CV_XD` |

### Outcome Area 4 — Effective Macroeconomics & Fiscal Management
| File | Covers |
|------|--------|
| `4_1_RESULTS_Debt_Sustainability.pdf` | `CSC_RES_DEBT_SUST_RISK` |
| `4_2_RESULTS_Domestic_Revenue_Mobilization.pdf` | `CSC_RES_TAX_REV_GDP` |
| `4_1_CONTEXT_Debt_Distress.pdf` | `FI_DEB_RISK` |
| `4_2_CONTEXT_Tax_RevenueGDP.pdf` | `FI_TAX_GD_ZS` |

### Outcome Area 5 — Green & Blue Planet and Resilient Populations
| File | Covers |
|------|--------|
| `5_1_RESULTS_Institutional_Net_Emissions.pdf` | `CSC_RES_GHG_EMS_YEAR` |
| `5_2_RESULTS_Resilience_to_Climate_Risks.pdf` | `CSC_RES_RESI_CLIM_RISK` |
| `5_3_RESULTS_Terrestrial_and_Aquatic_Areas.pdf` | `CSC_RES_TER_AQU_HECT` |
| `5_1_CONTEXT_Air_Quality.pdf` | `EN_ATM_HAZA` |
| `5_2_CONTEXT_Renewable_Natural_Capital.pdf` | `ER_NCA_RNEW` |
| `5_3_CONTEXT_Terrestrial_and_Aquatic_Areas.pdf` | `ER_PTD_TOTL_ZS` |
| `5_4_CONTEXT_Fish_Stocks.pdf` | `EN_FSH_SUST_ZS` |

### Outcome Area 6 — Inclusive & Equitable WASH
| File | Covers |
|------|--------|
| `6_1_RESULTS_Water_Sanitation_Hygiene.pdf` | `CSC_RES_WAT_SAN_HYG_TOT` |
| `6_1_CONTEXTVISION_Access_to_WASH.pdf` | `SH_H2O_STA_HYGN_ZS_TO` + `SH_H2O_STA_HYGN_TO` |
| `6_1_CONTEXTVISION_Access_to_WASH_1.pdf` | Supplementary / addendum to above |

### Outcome Area 7 — Sustainable Food Systems
| File | Covers |
|------|--------|
| `7_1_RESULTS_Food_and_Nutrition_Security.pdf` | `CSC_RES_FOOD_NUTR_SECU` |
| `7_1_CONTEXTVISION_Food_and_Nutrition_Insecurity.pdf` | `SN_ITK_MSFI_ZS` + `SN_ITK_MSFI_ZS_CC` |

### Outcome Area 8 — Connected Communities
| File | Covers |
|------|--------|
| `8_1_RESULTS_Sustainable_Transport.pdf` | `CSC_RES_ACCS_TRANS_INFRA_SERV` |
| `8_1_CONTEXT_Reliable_Transport.pdf` | `SP_ROD_R2KM` |

### Outcome Area 9 — Affordable, Reliable & Sustainable Energy
| File | Covers |
|------|--------|
| `9_1_RESULTS_Electricity_Access.pdf` | `CSC_RES_ELC_ACCS` (incl. MTF tier model + inferred access) |
| `9_2_RESULTS_RE_Capacity_Enabled.pdf` | `CSC_RES_REN_ENER_ENAB` |
| `9_1_CONTEXT_Access_to_Electricity.pdf` | `EG_ELC_ACCS_ZS` |

### Outcome Area 10 — Digital Connectivity
| File | Covers |
|------|--------|
| `10_1_RESULTS_Broadband_Internet.pdf` | `CSC_RES_BRO_INTE` |
| `10_1_CONTEXT_Internet_Use.pdf` | `IT_NET_USER_ZS` |

### Outcome Area 11 — Digital Services
| File | Covers |
|------|--------|
| `11_1_RESULTS_Digitally_Enabled_Services.pdf` | `CSC_RES_DIG_ENA_SERV` |
| `11_1_CONTEXT_eGovernance.pdf` | `IT_GOV_EGOV_XQ` |

### Outcome Area 12 — Gender Equality & Youth Inclusion
| File | Covers |
|------|--------|
| `12_1_RESULTS_Gender_Equality.pdf` | `CSC_RES_GEN_EQU_BENE` |
| `12_2_RESULTS_Financial_Services.pdf` | `CSC_RES_FIN_SERV_WOM` |
| `12_1_CONTEXT_Financial_Services.pdf` | `FX_OWN_TO` |

### Outcome Areas 13/14 — FCV / Jobs
| File | Covers |
|------|--------|
| `14_1_RESULTS_FDPs_and_Host_Communities.pdf` | `CSC_RES_DISP_COMM_SERVICES` |
| `14_1_CONTEXT_Poverty_in_FCS.pdf` | `CSC_CLI_EXT_POOR_FCS` |
| `14_2_CONTEXT_Displaced_People.pdf` | `SM_POP_FDIP` |
| `13_1_CONTEXT_Waged_Employment.pdf` | `SL_EMP_WORK_TO` |
| `13_2_CONTEXT_Youth_NEET.pdf` | `SL_UEM_NEET_ME_TO` |

### Outcome Area 15 — More Private Investments
| File | Covers |
|------|--------|
| `15_1_RESULTS_Private_Capital_Mobilized.pdf` | `CSC_RES_PRIV_CAP_MOBL` |
| `15_2_RESULTS_PCE.pdf` | `CSC_RES_PRIV_CAP_ENAB` (Private Capital Enabled) |
| `15_1_CONTEXT_Private_Investment.pdf` | `NE_GDI_FPRV_ZS` |

### Vision PDFs
| File | Covers |
|------|--------|
| `VISION_Extreme_Poverty.pdf` | `SI_POV_DDAY_TO` |
| `VISION_Prosperity_Gap.pdf` | `SI_POV_PROS` |
| `VISION_Gini_Indicator.pdf` | `SI_DST_INEQ` |
| `VISION_GHG_Emissions.pdf` | `EN_ATM_GHGT_GT_CE` |
| `VISION_Climate_Hazards.pdf` | `EN_CLM_VULN` |
| `VISION_Key_Ecosystems.pdf` | `ER_LND_HEAL` |

---

## 6. Methodology rules

**Double-counting:** `Double_Counting_Flag = 'Y'` means a project beneficiary is
counted in multiple indicators. Never sum across indicators without filtering.
```python
clean = proj[proj['Double_Counting_Flag'] != 'Y']
```

**Geography levels — do not mix rows from different levels:**
- Results: `GLOBAL > REGION > INCOME_GROUP > COUNTRY > SMALLSTATE`
- Context/Vision: `REGION > INCOME > ECONOMY > FCS > SIDS > LDC > SMALLSTATE`

**Organization hierarchy (Results files only):**
- `WBG` = IBRD + IDA + IFC + MIGA (headline number)
- `WB` = IBRD + IDA only
- `IDA` = IDA operations only
- IFC and MIGA: global aggregate only

**FCS filter:** `FCV_Flag = 'Y'` in WB Project Information sheet.

**Time periods:**
- FY25 = `Time_Period == pd.Timestamp('2025-06-30')`
- FY24 = `Time_Period == pd.Timestamp('2024-06-30')`
- Context/Vision: check each file — some store year as integer

**Achievement ratio:**
```python
df['ratio'] = (pd.to_numeric(df['Achieved_Results'], errors='coerce') /
               pd.to_numeric(df['Expected_Results'], errors='coerce'))
```

---

## 7. FY25 headline results

| Indicator | Achieved | Expected | Note |
|-----------|----------|----------|------|
| Social safety nets | 244M | ~313M | +12% YoY |
| Students supported | 325M | ~452M | +12% YoY |
| Health services | 370M | ~425M | +12% YoY |
| Electricity access | 215M | 576M | Behind target |
| Climate resilience | 244M | 425M | Behind target |
| Broadband users | 217M | — | 2× vs FY24 |
| Conservation hectares | 93M | — | +12% YoY |
| Countries <15% tax-to-GDP | 56 | — | Persistent |

---

## 8. Common pandas patterns

```python
import pandas as pd

# --- Results file (Schema A) ---
df = pd.read_excel('CSC_RES_HEA_SERV.xlsx', sheet_name='Aggregates')

# Global WBG headline, FY25
total = df[
    (df['Organization_Code'] == 'WBG') &
    (df['Geography_Type'] == 'GLOBAL') &
    (df['Demographic_Disaggregation'] == 'Total') &
    (df['Time_Period'] == pd.Timestamp('2025-06-30'))
]['Achieved_Results'].sum()

# IDA country breakdown, FY25, no double-counting
proj = pd.read_excel('CSC_RES_HEA_SERV.xlsx', sheet_name='WB Project Information')
fcs = proj[
    (proj['FCV_Flag'] == 'Y') &
    (proj['Double_Counting_Flag'] != 'Y') &
    (proj['Reporting_FY'] == 2025)
]

# --- Context/Vision file (Schema B) ---
ctx = pd.read_excel('EG_ELC_ACCS_ZS.xlsx', sheet_name='Aggregates')
# Country rows: Geography_Type == 'ECONOMY', data column is 'Value'
latest = (ctx[ctx['Geography_Type'] == 'ECONOMY']
            .sort_values('Time_Period', ascending=False)
            .groupby('Geography_Code').first().reset_index())

# --- PER_ALLSP_COV_POP_TO — two sub-indicators ---
sp = pd.read_excel('PER_ALLSP_COV_POP_TO.xlsx', sheet_name='Aggregates')
total_pop  = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_POP_TOT']
poorest_q1 = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_Q1_TOT']

# --- Food insecurity — pick the right file ---
# Client Context (country-level): SN_ITK_MSFI_ZS_CC.xlsx
# Vision (global/regional):       SN_ITK_MSFI_ZS.xlsx
```

---

## 9. AI response structure

Every prompt response includes 7 components in order:
1. Key takeaway — plain-language answer + headline numbers
2. Inline chart — from XLSX data matched to query scope
3. Related signals — 3–5 context-aware indicator chips (value + delta)
4. Related narratives — links to official scorecard pages
5. Guided follow-ups — 4–5 next prompts calibrated to persona intent
6. Citations — XLSX filenames, PDF notes, data as-of date
7. Actions — Copy / Helpful / Not helpful (left-aligned)

---

## 10. Personas & prompt parameters

| Parameter | External | Internal |
|-----------|----------|----------|
| Audience | External / Public | Internal / Task team |
| Geography | e.g. Global | e.g. Africa · FCS |
| Sector | e.g. Poverty & Social Protection | e.g. Health (HNP Services) |
| Intent | e.g. Understand impact | e.g. Diagnose gap · Act |

---

## 11. Design system

```
--navy:   #003F6B    --teal:   #00A0DF    --gold:   #E88B2B
--green:  #2E8B57    --red:    #D04040    --purple: #6B4FA0
--ink:    #1A1A2E    --paper:  #F8F7F4

Parameter chip colors:
  Audience  → purple  #EEEDFE / #CECBF6 / #3C3489
  Geography → green   #EAF3DE / #C0DD97 / #27500A
  Sector    → amber   #FAEEDA / #FAC775 / #854F0B
  Intent    → teal    #E6F1FB / #B5D4F4 / #0C447C

Fonts: Crimson Pro (headlines) · DM Mono (data) · DM Sans (UI/body)
```

---

## 12. Narrative page URLs

Base: `https://scorecard.worldbank.org/en/narratives/`

| Outcome Area | Slug |
|---|---|
| Protection for the Poorest | `protection-for-the-poorest/results-narrative` |
| No Learning Poverty | `no-learning-poverty/results-narrative` |
| Healthier Lives | `healthier-lives/results-narrative` |
| Green & Blue Planet | `green-and-blue-planet/results-narrative` |
| Sustainable Food Systems | `sustainable-food-systems/results-narrative` |
| Energy for All | `affordable-reliable-sustainable-energy/results-narrative` |
| Digital Connectivity | `digital-connectivity/results-narrative` |
| Digital Services | `digital-services/results-narrative` |
| Gender Equality & Youth | `gender-equality-and-youth-inclusion/results-narrative` |
| Better Lives in FCV | `better-lives-for-people-in-fragility/results-narrative` |
| More Private Investments | `more-private-investments/results-narrative` |

---

## 13. File loading order for Claude Code

1. `IDA_Scorecard_Metadata_1.xlsx` — indicator catalogue (always first)
2. Relevant `CSC_RES_*.xlsx` — use Schema A patterns
3. Relevant context/vision XLSX — use Schema B patterns (`Value` column, `ECONOMY` geography type)
4. Relevant PDF — never infer methodology from data alone
