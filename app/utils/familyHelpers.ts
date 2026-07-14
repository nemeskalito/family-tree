import type {
  FamilyPerson
} from '~/types/family'


export function findRoots(
  people: FamilyPerson[]
) {
  return people.filter(
    person =>
      person.parentIds.length === 0
  )
}


export function getChildren(
  people: FamilyPerson[],
  parentId: number
) {
  return people.filter(
    person =>
      person.parentIds.includes(parentId)
  )
}