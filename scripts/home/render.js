'use strict'

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (text = '') => String(text).replace(/[&<>"']/g, (c) => ESCAPES[c])

const SITE = 'https://zirekhq.github.io'
const ORG = 'https://github.com/ZirekHQ'
const ORG_BLOB = `${ORG}/.github/blob/main`
const CONTRIBUTING_URL = `${ORG_BLOB}/CONTRIBUTING.md`
const DESCRIPTION = 'Speech and screen-reader software for under-served languages.'
const MISSION = "Software that reads and speaks the languages large vendors don't get around to."
const LEAD = 'Two strands that meet: screen-reader support for under-served languages, and the local neural speech synthesis that makes a screen reader usable in the first place.'
const GROUPS = [
  ['screen-readers', 'Screen readers'],
  ['speech-synthesis', 'Speech synthesis'],
  ['translation', 'Translation'],
]

const repoUrl = (project) => `${ORG}/${project.slug}`
const dateOf = (iso) => iso.slice(0, 10)
const latestOf = (project) => project.releases[0]
const hasDocs = (project) => Boolean(project.docsComponent) && project.versions.length > 0
const docsVersion = (project) => project.versions.find((v) => v !== 'next') ?? project.versions[0]
const docsUrl = (project, version) => `/en/${project.docsComponent}/${version}/`
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`

const versionBadge = (project) =>
  latestOf(project) ? ` <span class="badge version">${esc(latestOf(project).tag)}</span>` : ''

const metaLine = (project) =>
  [project.language, project.license === 'NOASSERTION' ? undefined : project.license, project.stars === undefined ? undefined : `★ ${project.stars}`]
    .filter(Boolean).map(esc).join(' · ')

const versionLinks = (project) =>
  project.versions.map((v) => link(docsUrl(project, v), v)).join(' ')

const projectLinks = (project) =>
  [
    project.getUrl === repoUrl(project) ? '' : link(project.getUrl, project.getLabel),
    hasDocs(project) ? link(docsUrl(project, docsVersion(project)), 'Documentation') : '',
    link(repoUrl(project), 'Source'),
    link(`${repoUrl(project)}/issues`, `Issues (${project.openIssues ?? 0})`),
  ].filter(Boolean).join(' · ')

const card = (project) => `
<article class="card" id="${esc(project.slug)}">
  <img class="card-logo" src="/assets/${esc(project.logo)}" alt="" width="64" height="64">
  <h4>${esc(project.name)}${versionBadge(project)}</h4>
  <p>${esc(project.tagline)}</p>
  <p class="meta">${metaLine(project)}</p>
  ${hasDocs(project) ? `<p class="versions">Documented versions: ${versionLinks(project)}</p>` : ''}
  <p class="project-links">${projectLinks(project)}</p>
</article>`

const groupSection = ([key, title], projects) => {
  const members = projects.filter((p) => p.group === key)
  return members.length === 0
    ? ''
    : `<div class="group"><h3>${esc(title)}</h3><div class="cards">${members.map(card).join('')}</div></div>`
}

const projectsSection = (projects) =>
  `<section id="projects" aria-labelledby="projects-title"><h2 id="projects-title">Projects</h2>${GROUPS.map((g) => groupSection(g, projects)).join('')}</section>`

const feedItem = (item) => `
<li><strong>${esc(item.project)} ${esc(item.tag)}</strong> <time datetime="${esc(item.date)}">${esc(dateOf(item.date))}</time>
  <p>${esc(item.excerpt)}</p><a href="${esc(item.url)}">Release notes</a></li>`

const feedList = (feed) =>
  feed.length === 0 ? '<p>No releases yet.</p>' : `<ul class="feed">${feed.map(feedItem).join('')}</ul>`

const releasesSection = (feed) => `
<section id="releases" aria-labelledby="releases-title"><h2 id="releases-title">Latest releases</h2>
${feedList(feed)}</section>`

const helpSection = () => `
<section id="help-wanted" aria-labelledby="help-title"><h2 id="help-title">Help wanted</h2>
<p>Kurmanji is badly served by assistive technology, and most of the gap needs native speakers rather than programmers:</p>
<ul><li><strong>Voice recordings</strong> for text-to-speech training.</li></ul>
<p>Sorani and Zazaki speakers are just as welcome; the work is Kurmanji-first only because that is where it started.</p>
<p>On the synthesis side the shortage is different:</p>
<ul><li><strong>Windows testers</strong> for dengjen-nvda, especially against current NVDA releases.</li>
<li><strong>Co-maintainers.</strong> The add-on has one maintainer, which is one too few.</li></ul>
<p>Open an issue on the relevant repository, and read the ${link(CONTRIBUTING_URL, 'contribution guide')}. You do not need to write code to help.</p></section>`

const supportSection = () => `
<section id="support" aria-labelledby="support-title"><h2 id="support-title">Support the work</h2>
<p>Contributions go through ${link('https://opencollective.com/zirek', 'Open Collective')}.</p></section>`

const COMMUNITY = [
  ['Contribute', `${ORG_BLOB}/CONTRIBUTING.md`],
  ['Security policy', `${ORG_BLOB}/SECURITY.md`],
  ['Code of conduct', `${ORG_BLOB}/CODE_OF_CONDUCT.md`],
  ['Support', `${ORG_BLOB}/SUPPORT.md`],
]

const linkItem = ([title, url]) => `<li>${link(url, title)}</li>`

const linkList = (links) => `<ul class="links">${links.map(linkItem).join('')}</ul>`

const communitySection = () =>
  `<section id="community" aria-labelledby="community-title"><h2 id="community-title">Community</h2>${linkList(COMMUNITY)}</section>`

const head = () => `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZirekHQ</title><meta name="description" content="${esc(DESCRIPTION)}">
<link rel="canonical" href="${SITE}/">
<meta property="og:title" content="ZirekHQ"><meta property="og:description" content="${esc(DESCRIPTION)}">
<meta property="og:image" content="${SITE}/assets/social-preview.png"><meta name="twitter:card" content="summary_large_image">
<script>try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<link rel="icon" href="/assets/favicon.ico"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/home.css"></head>`

const nav = () => `<nav aria-label="Primary"><a href="#projects">Projects</a><a href="/en/home/">Docs</a><a href="#releases">Releases</a><a href="#help-wanted">Help wanted</a><a href="#support">Support</a><a href="${ORG}">GitHub</a></nav>`

const header = () => `
<header class="site-header"><a class="brand" href="/"><img src="/assets/zirek-avatar.png" alt="" width="32" height="32"><span>ZirekHQ</span></a>
${nav()}<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Dark mode" aria-pressed="false" hidden>◐</button></header>`

const footer = (year) => `<footer class="site-footer"><p>Copyright © ${esc(year)} ZirekHQ. Released under open-source licenses.</p>
${linkList([['GitHub', ORG], ...COMMUNITY.slice(1)])}</footer>`

const hero = () => `
<section id="hero" aria-labelledby="hero-title"><h1 id="hero-title">${esc(MISSION)}</h1><p class="lead">${esc(LEAD)}</p>
<p><a class="button" href="#projects">Browse projects</a> <a class="button secondary" href="/en/home/">Read the docs</a></p></section>`

const mainContent = ({ projects, feed }) =>
  `<main id="main" tabindex="-1">${hero()}${projectsSection(projects)}${releasesSection(feed)}${helpSection()}${supportSection()}${communitySection()}</main>`

const renderPage = (model) => `<!doctype html>
<html lang="en">${head()}
<body><a class="skip-link" href="#main">Skip to main content</a>${header()}${mainContent(model)}${footer(model.year)}<script src="/assets/home.js" defer></script></body></html>`

module.exports = { renderPage, esc }
