import { danger, fail } from 'danger'

function main() {
  // Request a CHANGELOG entry
  const hasChangelog = danger.git.modified_files.includes('CHANGELOG.md')

  if (hasChangelog) {
    return
  }

  console.log({
    labels: danger.github.issue.labels,
  })

  fail('Add an entry to CHANGELOG.md')
}

main()
