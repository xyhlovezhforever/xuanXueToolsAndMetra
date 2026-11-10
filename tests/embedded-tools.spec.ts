import { expect, test } from '@playwright/test'

test('自制工具通过 iframe 打开独立网页项目与游戏预览', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/')
  await expect.poll(async () => {
    try {
      const response = await page.request.get('/api/health')
      return response.ok() && (await response.json()).ok === true
    } catch { return false }
  }).toBe(true)
  await page.getByRole('navigation', { name: '主要板块' }).getByRole('button', { name: '自制工具' }).click()
  await expect(page.getByRole('navigation', { name: '工具分类' })).toHaveCount(0)

  const tabs = page.getByRole('navigation', { name: '自制工具列表' })
  const frame = page.frameLocator('.embedded-tool-stage iframe')
  await expect(tabs.getByRole('button')).toHaveCount(5)
  await expect(frame.getByRole('heading', { name: '点赞与收藏监测' })).toBeVisible({ timeout: 40_000 })

  await tabs.getByRole('button', { name: /视评台 · 视频链接/ }).click()
  await expect(frame.getByRole('heading', { name: '一个链接，看完视频，也看懂评论' })).toBeVisible({ timeout: 40_000 })

  await tabs.getByRole('button', { name: /发稿台/ }).click()
  await expect(frame.locator('#root')).toBeVisible({ timeout: 40_000 })
  await expect(frame.getByRole('heading', { name: '工作区没有启动' })).toHaveCount(0)

  await tabs.getByRole('button', { name: /午夜分拣台/ }).click()
  await expect(frame.getByRole('button', { name: '启动游戏' })).toBeVisible()
  await expect(frame.locator('#preview')).toHaveJSProperty('complete', true)
  await expect(frame.locator('#preview')).not.toHaveJSProperty('naturalWidth', 0)

  await tabs.getByRole('button', { name: /星灯试炼/ }).click()
  await expect(frame.getByRole('button', { name: '启动游戏' })).toBeVisible()
  await expect(frame.locator('#preview')).not.toHaveJSProperty('naturalWidth', 0)
})
