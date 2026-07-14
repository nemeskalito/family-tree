
export function calculateAge(
  birthDate: string,
  deathDate: string | null
): number {
  const birth = new Date(birthDate)

  const end = deathDate
    ? new Date(deathDate)
    : new Date()

  let age = end.getFullYear() - birth.getFullYear()

  const month = end.getMonth() - birth.getMonth()

  if (
    month < 0 ||
    (month === 0 && end.getDate() < birth.getDate())
  ) {
    age--
  }

  return age
}