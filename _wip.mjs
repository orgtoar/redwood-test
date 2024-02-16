import { Octokit } from 'octokit'
import { fs } from 'zx'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

async function main() {
  const page = 1

  const res = await octokit.request(
    `GET /repos/{owner}/{repo}/releases?per_page=100&page=${page}`,
    {
      owner: 'redwoodjs',
      repo: 'redwood',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  const changelog = []

  for (const release of res.data) {
    if (release.tag_name.includes('rc')) {
      console.log(`skipping rc ${release.tag_name}`)
      continue
    }

    if (release.name !== release.tag_name) {
      console.log('name !== tag_name')
      console.log({
        name: release.name,
        tag_name: release.tag_name,
        html_url: release.html_url,
      })
    }

    const isMajor = release.tag_name.endsWith('0.0')

    const changelogEntry = []
    changelogEntry.push(`## ${release.tag_name}`)

    if (!isMajor) {
      changelog.push(
        [...changelogEntry, '', `- See ${release.html_url}`, ''].join('\n')
      )
      continue
    }

    console.log('-'.repeat(process.stdout.columns))
    console.log(release.tag_name)
    console.log(release.body)
    console.log()
    continue

    const match = release.body.match(
      /https:\/\/community\.redwoodjs\.com\/[^\s]+/
    )

    if (!match) {
      console.error(`No upgrade guide found for ${release.tag_name}`)
      changelog.push(
        [...changelogEntry, '', `- See ${release.html_url}`, ''].join('\n')
      )
      continue
    }

    changelog.push(
      [
        ...changelogEntry,
        '',
        `- See ${release.html_url} for release notes and ${match[0]} for the upgrade guide`,
        '',
      ].join('\n')
    )
  }

  // await fs.appendFile('CHANGELOG.md', '\n')
  // await fs.appendFile('CHANGELOG.md', changelog.join('\n'))
}

main()
