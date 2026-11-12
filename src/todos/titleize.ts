export function titleize(text: string): string {
  return text.trim().replace(/\S+/gu, word => {
    const [first, ...rest] = Array.from(word)
    return first.toLocaleUpperCase() + rest.join('')
  })
}
