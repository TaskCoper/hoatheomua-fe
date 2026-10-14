export const VAT_RATE = 0.08

interface CalculateVatArgs {
  /** What VAT is charged on before any voucher - the products, not shipping or cards. */
  vatApplicableAmount: number
  voucherDiscount: number
  /** An order only owes VAT when the buyer asked for an invoice with a tax code. */
  isSubjectToVat: boolean
}

/**
 * VAT is charged on what is left after the voucher comes off, never on the sticker
 * price, and a voucher bigger than the goods cannot push the taxable amount below zero.
 */
export const calculateVat = ({ vatApplicableAmount, voucherDiscount, isSubjectToVat }: CalculateVatArgs) => {
  const taxableAmount = Math.max(0, vatApplicableAmount - voucherDiscount)

  return {
    taxableAmount,
    // Whole dong, like every other amount in the order.
    vatAmount: isSubjectToVat ? Math.round(taxableAmount * VAT_RATE) : 0
  }
}
