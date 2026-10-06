/** Temporary UI data until the slot availability API is available. */
export const getMockSlotRemaining = (index: number): number => {
  const sample = [3, 1, 0, 5, 2, 0, 4, 1, 3, 2]
  return sample[index % sample.length] ?? 0
}
