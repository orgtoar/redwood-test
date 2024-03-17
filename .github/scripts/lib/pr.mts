import { context as ghContext } from '@actions/github'
import { $ } from 'zx'
import { getLines } from './zxHelpers.mjs'

type Label = {
  name: string
}

function getPrLabels(): Label[] {
  return []
}

export function prHasLabel(label) {
  const labels = getPrLabels()
  return labels.some((l) => l.name === label)
}

export async function getPrChangedFiles() {
  await $`git fetch origin main`.quiet()
  const changedFiles = getLines(await $`git diff origin/main --name-only`.quiet())
  return changedFiles
}

export async function prHasChangeset() {
  const changedFiles = await getPrChangedFiles()
  return changedFiles.some((file) => file.startsWith('.changesets/'))
}

export function getPr() {
  if (!ghContext.payload.pull_request) {
    throw new Error('This action can only be run on pull requests')
  }

  return ghContext.payload.pull_request
}

export async function prRebuildsCreateRedwoodAppTemplate() {
  const changedFiles = await getPrChangedFiles()
  return changedFiles.some((file) => file.startsWith('packages/create-redwood-app/templates/js'))
}

export async function prShouldRebuildCreateRedwoodAppTemplate() {
  const changedFiles = await getPrChangedFiles()
  return changedFiles.some((file) => file.startsWith('packages/create-redwood-app/templates/ts'))
}
