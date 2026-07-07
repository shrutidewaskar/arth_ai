# Indian Tax Regimes: Old vs New Reference

For the Indian Middle Class, selecting the tax regime is a core financial decision. The AI engine must calculate cash flow effects based on these parameters.

## Old Regime vs New Regime (FY 2024-25 / AY 2025-26 onwards)

### Old Regime (Deductions Allowed)
Allows standard deductions under Section 80C, 80D, 24(b) (Home loan interest), HRA exemption, etc.
- **Section 80C:** Up to ₹1.5 Lakhs (includes EPF, PPF, ELSS mutual funds, LIC premiums, home loan principal).
- **Section 80D:** Medical insurance premium (up to ₹25,000 for self/family, additional ₹25,000/₹50,000 for parents).
- **Section 24(b):** Interest on self-occupied home loan up to ₹2 Lakhs.
- **HRA (House Rent Allowance):** Tax exemption for rent paid.

### New Regime (No Deductions, Lower Slabs)
Introduced under Section 115BAC. Standard deduction of ₹75,000 is allowed, but almost all other deductions (80C, 80D, 24(b) for self-occupied home, HRA) are disallowed.
- Slabs:
  - Up to ₹3,000,000: Nil
  - ₹3,000,001 - ₹7,000,000: 5%
  - ₹7,000,001 - ₹1,000,000: 10%
  - ₹1,000,001 - ₹1,200,000: 15%
  - ₹1,200,001 - ₹1,500,000: 20%
  - Above ₹1,500,000: 30%
- Tax rebate under Section 87A: Taxable income up to ₹7 Lakhs pays zero tax.

## AI Reasoning Context Formula
When checking if a user should switch regime:
$$\text{Tax savings} = \text{Tax}_{\text{Old}}(\text{Income} - \text{Deductions}) - \text{Tax}_{\text{New}}(\text{Income})$$
If $\text{Tax savings} < 0$, default the AI recommendation to switch to the **New Regime** and reallocate the deductions (e.g. ELSS) to standard equity mutual funds.
