import { expect, test } from '@playwright/test'

test('资料检索、详情与排盘链路可用', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page).toHaveTitle(/玄枢/)
  await expect(page.getByRole('heading', { name: '全部资料' })).toBeVisible()
  if (testInfo.project.name === 'desktop') {
    await expect(page.getByText('引擎计算')).toBeVisible({ timeout: 10_000 })
  }

  const search = page.getByPlaceholder('搜索流派、口诀、经典或术式')
  await search.fill('六爻')
  await expect(page.getByRole('heading', { name: '六爻用神取用' })).toBeVisible()
  await page.getByRole('heading', { name: '六爻用神取用' }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: '六爻用神取用' })).toBeVisible()
  await expect(page.getByRole('dialog').getByRole('heading', { name: '一个合格问题包含什么' })).toBeAttached()
  await expect(page.getByRole('dialog').getByText('按问题主题选取的核心六亲或象。')).toBeAttached()
  await page.getByRole('button', { name: '返回资料库' }).click()
  await search.fill('')

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
