/**
 * Compares two arrays to see if they are equal
 * @param a Array A
 * @param b Array B
 */
export function compareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}
