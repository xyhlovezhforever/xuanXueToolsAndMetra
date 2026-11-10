import { expect, test } from '@playwright/test'

test('合并后的资料、工具与生活板块可用', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/hexagram-analysis', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ analysis: '测试解读', model: 'test-model' }) }))
  await page.goto('/')

  const primary = page.getByRole('navigation', { name: '主要板块' })
  for (const name of ['资料', '工具', '自制工具', '心流', '断舍离', '现代风水', '情绪周边设计', '共同学习进步']) {
    await expect(primary.getByRole('button', { name, exact: true })).toBeVisible()
  }

  const formats = page.getByRole('navigation', { name: '资料形式' })
  await expect(formats.getByRole('button')).toHaveCount(5)
  await formats.getByRole('button', { name: '图解专题' }).click()
  await page.getByRole('navigation', { name: '图解专题' }).getByRole('button', { name: '先天八卦' }).click()
  await expect(page.frameLocator('.xunlan-frame').getByRole('heading', { name: '先天八卦', exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: '图解专题' }).getByRole('button', { name: '塔罗全牌' }).click()
  await expect(page.frameLocator('.xunlan-frame').getByRole('heading', { name: '塔罗全套 78 张' })).toBeVisible()

  await primary.getByRole('button', { name: '工具', exact: true }).click()
  await page.getByRole('navigation', { name: '工具分类' }).getByRole('button', { name: '数字起卦' }).click()
  const casting = page.frameLocator('.xunlan-frame')
  await casting.getByRole('textbox', { name: '下卦，三位数字' }).fill('008')
  await casting.getByRole('textbox', { name: '上卦，三位数字' }).fill('006')
  await casting.getByRole('textbox', { name: '动爻，三位数字' }).fill('006')
  await casting.getByRole('button', { name: '计算并分析' }).click()
  await expect(casting.getByText('水地比', { exact: false }).first()).toBeVisible()

  await primary.getByRole('button', { name: '心流' }).click()
  await expect(page.getByRole('timer')).toContainText('25:00')
  await page.getByRole('button', { name: '开始专注' }).click()
  await expect(page.getByRole('button', { name: '暂停' })).toBeVisible()
  await page.getByRole('button', { name: '暂停' }).click()
  await page.getByPlaceholder('先记下，专注结束后再处理').fill('回复消息')
  await page.getByRole('button', { name: '记下' }).click()
  await expect(page.getByText('回复消息')).toBeVisible()
  await page.getByText('先定义一个可完成的任务').click()
  await expect(page.getByText('把“写方案”改成“完成方案的目录和第一节草稿”。')).toBeVisible()

  await primary.getByRole('button', { name: '断舍离' }).click()
  await page.getByPlaceholder('例如：整理桌面文件').fill('整理书桌')
  await page.getByRole('button', { name: '添加' }).click()
  await expect(page.getByText('整理书桌')).toBeVisible()
  await page.getByPlaceholder('例如：备用台灯').fill('闲置花瓶')
  await page.getByRole('button', { name: '加入整理清单' }).click()
  await expect(page.getByText(/闲置花瓶：考虑转赠/)).toBeVisible()

  await primary.getByRole('button', { name: '现代风水' }).click()
  await page.getByRole('button', { name: '卧室' }).click()
  await expect(page.getByText('夜间光线可调暗')).toBeVisible()
  await page.getByPlaceholder('写下观察时间、问题位置和试过的调整').fill('夜间窗边有噪声')
  await expect(page.locator('.life-progress')).toHaveAttribute('max', '3')

  await primary.getByRole('button', { name: '情绪周边设计' }).click()
  await page.getByPlaceholder('给想法起一个名字').fill('平静卡片')
  await page.getByRole('button', { name: '保存想法' }).click()
  await expect(page.getByRole('heading', { name: '平静卡片' })).toBeVisible()
  await expect(page.getByRole('region', { name: '配色试验' }).locator('input[type="color"]')).toHaveCount(2)

  await primary.getByRole('button', { name: '共同学习进步' }).click()
  await page.getByPlaceholder('记录一个发现、问题或下一步').fill('本周一起读资料')
  await page.getByPlaceholder('一个具体问题').fill('如何核对资料来源')
  await expect(page.getByRole('region', { name: '实践资料' }).locator('details')).toHaveCount(3)
  await expect(page.getByRole('button', { name: '复制学习进度' })).toBeVisible()
  await page.reload()
  await primary.getByRole('button', { name: '共同学习进步' }).click()
  await expect(page.getByPlaceholder('记录一个发现、问题或下一步')).toHaveValue('本周一起读资料')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  expect(errors).toEqual([])
})

test('资料门类按主题分组并可切换筛选', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.locator('.reference-card').first().locator('.card-meta')).toContainText('易学基础')
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '打开导航' }).click()
    const menu = page.getByRole('dialog', { name: '移动导航' })
    await menu.getByText('命理与占测').click()
    await menu.getByRole('button', { name: /八字子平/ }).click()
  } else {
    const sidebar = page.getByRole('complementary', { name: '资料分类' })
    await expect(sidebar.getByRole('button', { name: '基础与文献 3 类' })).toHaveAttribute('aria-expanded', 'true')
    await sidebar.getByRole('button', { name: '命理与占测 5 类' }).click()
    await sidebar.getByRole('button', { name: /八字子平/ }).click()
  }
  await expect(page.getByRole('heading', { name: '八字子平' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '资料形式' }).getByRole('button', { name: '资料库' })).toHaveAttribute('aria-current', 'page')
})

test('心流计时在时间跳过后准确完成一次', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('navigation', { name: '主要板块' }).getByRole('button', { name: '心流' }).click()
  await page.getByRole('button', { name: '15 分钟' }).click()
  await page.getByRole('button', { name: '开始专注' }).click()
  await page.clock.fastForward(15 * 60 * 1000)
  await expect(page.getByRole('timer')).toContainText('00:00')
  await expect(page.locator('.life-stat b')).toHaveText('1')
})

test('浏览器同源的 AI 请求通过开发代理的来源校验', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const response = await fetch('/api/hexagram-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    return { status: response.status, body: await response.json() }
  })
  expect(result.status).toBe(400)
  expect(result.body.error).toBe('起卦参数不正确')
})

test('工具中的小六壬可速起并查看手掌图', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: '主要板块' }).getByRole('button', { name: '工具', exact: true }).click()
  await page.getByRole('navigation', { name: '工具分类' }).getByRole('button', { name: '小六壬速起' }).click()
  const tool = page.frameLocator('.xunlan-frame')
  await expect(tool.getByRole('heading', { name: '当前时间快速起卦' })).toBeVisible()
  await tool.getByRole('button', { name: '立即起卦' }).click()
  await expect(tool.locator('.liuren-quick-result')).toContainText('时宫 · 结果')
  await expect(tool.getByRole('img', { name: /小六壬左手掌诀六宫定位图/ })).toBeVisible()
})

test('小六壬速起结果可请求 AI 分析', async ({ page }) => {
  let payload: Record<string, unknown> | null = null
  await page.route('**/api/xiaoliuren-analysis', async (route) => {
    payload = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ analysis: '先核对信息，再决定下一步。', model: 'test-model' }) })
  })
  await page.goto('/')
  await page.getByRole('navigation', { name: '主要板块' }).getByRole('button', { name: '工具', exact: true }).click()
  await page.getByRole('navigation', { name: '工具分类' }).getByRole('button', { name: '小六壬速起' }).click()
  const tool = page.frameLocator('.xunlan-frame')
  await tool.getByRole('button', { name: '立即起卦' }).click()
  await tool.getByPlaceholder('例如：这件事该如何推进？').fill('这件事如何推进？')
  await tool.getByRole('button', { name: 'AI 分析' }).click()
  await expect(tool.getByText('先核对信息，再决定下一步。')).toBeVisible()
  expect(payload).toMatchObject({ question: '这件事如何推进？', provider: 'alibaba', tier: 'balanced' })
  expect(payload?.timestamp).toEqual(expect.any(String))
  expect(payload?.timeZone).toEqual(expect.any(String))
})
