import { expect, test } from '@playwright/test'

test('资料检索、详情与排盘链路可用', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page).toHaveTitle(/玄枢/)
  await expect(page.getByRole('heading', { name: '全部资料' })).toBeVisible()
  await expect(page.getByText('168 个专题')).toBeVisible()
  if (testInfo.project.name === 'desktop') {
    await expect(page.getByText('引擎计算')).toBeVisible({ timeout: 10_000 })
  }

  const search = page.getByPlaceholder('搜索流派、口诀、经典或术式')
  await search.fill('六爻')
  await expect(page.getByRole('heading', { name: '六爻用神取用' })).toBeVisible()
  await page.getByRole('heading', { name: '六爻用神取用' }).click()
  await expect(page).toHaveURL(/#\/article\/liuyao-yongshen/)
  await expect(page.getByRole('main').getByRole('heading', { name: '六爻用神取用' })).toBeVisible()
  await expect(page.getByRole('main').getByRole('heading', { name: '一个合格问题包含什么' })).toBeAttached()
  await expect(page.getByRole('main').getByText('按问题主题选取的核心六亲或象。')).toBeAttached()
  await expect(page.locator('.sidebar')).toHaveCount(0)
  await expect(page.locator('.right-rail')).toHaveCount(0)
  await page.getByRole('button', { name: '返回资料库' }).click()
  await expect(page.getByRole('heading', { name: '全部资料' })).toBeVisible()
  await search.fill('')

  await search.fill('节气发生在精确时刻')
  await expect(page.getByRole('heading', { name: '二十四节气与月建' })).toBeVisible()
  await search.fill('')

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click()
    await page.getByRole('dialog', { name: '移动导航' }).getByRole('button', { name: '全典总纲' }).click()
  } else {
    await page.getByRole('button', { name: '全典总纲' }).click()
  }
  await expect(page.getByRole('heading', { name: '全典不是一句“都有”，而是每一项都能找到' })).toBeVisible()
  await expect(page.getByText('十五个本地排盘引擎')).toBeVisible()
  await page.getByRole('button', { name: /进入该体系/ }).first().click()
  await expect(page.getByRole('heading', { name: '易学基础' })).toBeVisible()

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click()
    await page.getByRole('dialog', { name: '移动导航' }).getByRole('button', { name: '典籍全文' }).click()
  } else {
    await page.getByRole('button', { name: '典籍全文' }).click()
  }
  await expect(page.getByRole('heading', { name: '典籍全文库' })).toBeVisible()
  await expect(page.getByText('26部核心典籍')).toBeVisible()
  await page.getByPlaceholder('搜索书名、作者、朝代或内容主题').fill('滴天髓')
  await expect(page.getByRole('heading', { name: '滴天髓' })).toBeVisible()

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click()
    await expect(page.getByRole('dialog', { name: '移动导航' })).toBeVisible()
    await page.getByRole('dialog', { name: '移动导航' }).getByRole('button', { name: '术数查表' }).click()
  } else {
    await page.getByRole('button', { name: '术数查表' }).click()
  }

  await expect(page.getByRole('heading', { name: '术数查表' })).toBeVisible()
  await expect(page.locator('.hexagram-card')).toHaveCount(64)
  await page.getByRole('button', { name: '二十四山' }).click()
  await expect(page.getByRole('cell', { name: '352.5° 至 7.5°' })).toBeVisible()

  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click()
    await page.getByRole('dialog', { name: '移动导航' }).getByRole('button', { name: '排盘工具' }).click()
  } else {
    await page.getByRole('button', { name: '排盘工具' }).click()
  }

  await expect(page.getByRole('heading', { name: '排盘工具' })).toBeVisible()
  await page.getByRole('button', { name: /查询黄历/ }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: /八字命盘/ }).click()
  await page.getByRole('button', { name: /生成命盘/ }).click()
  await expect(page.getByText('日主', { exact: true })).toBeVisible({ timeout: 10_000 })

  if (testInfo.project.name === 'desktop') {
    await page.getByRole('button', { name: /奇门遁甲/ }).click()
    await expect(page.getByLabel('专家 JSON 参数')).toHaveValue(/事业发展如何/)
    await page.getByRole('button', { name: '运行奇门遁甲' }).click()
    await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible({ timeout: 10_000 })
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
})
