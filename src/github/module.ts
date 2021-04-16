import { Module } from '@nuxt/types'
import { DocusSettings } from '../types/core'
import { get, fetch } from './github'

export default <Module>function docusGithubModule() {
  const { nuxt } = this
  const { hook, options } = nuxt

  options.privateRuntimeConfig = options.privateRuntimeConfig || {}
  options.privateRuntimeConfig.githubToken = process.env.GITHUB_TOKEN

  // Inject `docus` into ssrContext (for releases)
  // TODO: this could be removed when using $fetch with @nuxt/nitro to handle baseUrl with nuxt generate (using universal fetch)
  hook('vue-renderer:context', (ssrContext: any) => {
    ssrContext.docus = {
      releases: get()
    }
  })

  hook('docus:content:ready', ({ $content, settings }: { $content: any; settings: DocusSettings }) => {
    fetch({ $content, settings }).then(releases => {
      $content.database.items.insert({
        path: '/_docus/repo/github',
        releases
      })
    })
  })
}
