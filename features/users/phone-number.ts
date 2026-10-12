export const normalizePhoneNumber = (value: string): string | null => {
  if (value.length > 32) return null
  let phone = value.trim().replace(/\s/g, '')
  if (phone.startsWith('+84')) phone = '0' + phone.slice(3)
  else if (phone.startsWith('84')) phone = '0' + phone.slice(2)
  return /^0\d{9,10}$/.test(phone) ? phone : null
}
