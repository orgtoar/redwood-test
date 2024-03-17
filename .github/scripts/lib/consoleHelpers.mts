import boxen from 'boxen'

export function consoleBoxen(title: string, message: string) {
  console.error(
    boxen(message, {
      title,
      borderStyle: "round",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 1, bottom: 0, left: 1 },
    }),
  )
}
