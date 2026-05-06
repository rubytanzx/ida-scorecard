# Common Pandas Patterns

```python
import pandas as pd

# --- Results file: Schema A ---
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

# --- Context/Vision file: Schema B ---
ctx = pd.read_excel('EG_ELC_ACCS_ZS.xlsx', sheet_name='Aggregates')

# Country rows use Geography_Type == 'ECONOMY'; data column is 'Value'
latest = (
    ctx[ctx['Geography_Type'] == 'ECONOMY']
    .sort_values('Time_Period', ascending=False)
    .groupby('Geography_Code')
    .first()
    .reset_index()
)

# --- PER_ALLSP_COV_POP_TO: two sub-indicators ---
sp = pd.read_excel('PER_ALLSP_COV_POP_TO.xlsx', sheet_name='Aggregates')
total_pop = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_POP_TOT']
poorest_q1 = sp[sp['Indicator_Code'] == 'PER_ALLSP_COV_Q1_TOT']

# --- Food insecurity: pick the right file ---
# Client Context country-level: SN_ITK_MSFI_ZS_CC.xlsx
# Vision global/regional:       SN_ITK_MSFI_ZS.xlsx
```
