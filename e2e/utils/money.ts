export const parseVnd = (text: string): number => {
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return Number.NaN

  // vi-VN renders negatives as `-3.000 ₫`
  return text.trimStart().startsWith('-') ? -Number(digits) : Number(digits)
}
