import { expect, test } from '@playwright/test'

async function openTools(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('navigation', { name: '主要板块' }).getByRole('button', { name: '工具', exact: true }).click()
  await expect(page.getByRole('heading', { name: '排盘工具' })).toBeVisible()
  await expect(page.getByRole('group', { name: '参数输入方式' })).toBeVisible()
}

async function pickTool(page: import('@playwright/test').Page, id: string, label: string) {
  const picker = page.locator('.mobile-tool-picker select')
  if (await picker.isVisible()) await picker.selectOption(id)
  else await page.locator('.tool-catalog button').filter({ hasText: label }).click()
}

test('全部计算工具默认提供表单输入', async ({ page }) => {
  await openTools(page)
  const catalog = page.locator('.tool-catalog button')
  const picker = page.locator('.mobile-tool-picker select')
  await expect(catalog).toHaveCount(15)
  for (let index = 0; index < 15; index += 1) {
    if (await picker.isVisible()) await picker.selectOption((await picker.locator('option').nth(index).getAttribute('value'))!)
    else await catalog.nth(index).click()
    await expect(page.getByRole('group', { name: '参数输入方式' }).getByRole('button', { name: '表单' })).toHaveClass(/active/)
    await expect(page.getByLabel('专家 JSON 参数')).toHaveCount(0)
    await expect(page.locator('.human-form-grid').first()).toBeVisible()
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

test('四柱反推用四个中文输入生成参数，高级模式仍可编辑 JSON', async ({ page }) => {
  let body: Record<string, unknown> | null = null
  await page.route('**/api/divination/bazi_pillars_resolve', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: { matches: [] } }) })
  })
  await openTools(page)
  await pickTool(page, 'bazi_pillars_resolve', '四柱反推')
  await page.getByLabel('年柱').fill('甲子')
  await page.getByLabel('月柱').fill('丙寅')
  await page.getByLabel('日柱').fill('己巳')
  await page.getByLabel('时柱').fill('丁卯')
  await page.getByRole('button', { name: '运行四柱反推' }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible()
  expect(body).toMatchObject({ yearPillar: '甲子', monthPillar: '丙寅', dayPillar: '己巳', hourPillar: '丁卯' })
  await page.getByRole('group', { name: '参数输入方式' }).getByRole('button', { name: 'JSON' }).click()
  await expect(page.getByLabel('专家 JSON 参数')).toBeVisible()
})

test('六爻数字起卦可选择用神并填写数字', async ({ page }) => {
  let body: Record<string, unknown> | null = null
  await page.route('**/api/divination/liuyao', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: { hexagram: '测试卦' } }) })
  })
  await openTools(page)
  await pickTool(page, 'liuyao', '六爻排卦')
  await page.getByRole('textbox', { name: '所问之事' }).fill('这件事如何推进？')
  await page.getByRole('checkbox', { name: '官鬼' }).check()
  await page.getByLabel('起卦方式').selectOption('number')
  await page.getByLabel('上卦数').fill('8')
  await page.getByLabel('下卦数').fill('6')
  await page.getByLabel('动爻数（选填）').fill('3')
  await page.getByRole('button', { name: '运行六爻排卦' }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible()
  expect(body).toMatchObject({ question: '这件事如何推进？', yongShenTargets: ['官鬼'], method: 'number', numbers: [8, 6, 3] })
})

test('紫微飞星可添加不同宫位查询', async ({ page }) => {
  let body: Record<string, unknown> | null = null
  await page.route('**/api/divination/ziwei_flying_star', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: { queries: [] } }) })
  })
  await openTools(page)
  await pickTool(page, 'ziwei_flying_star', '紫微飞星')
  await page.getByLabel('性别').selectOption('female')
  await page.getByLabel('出生日期').fill('1990-01-15')
  await page.getByLabel('出生时间').fill('09:00')
  await page.getByRole('button', { name: '添加查询' }).click()
  await page.getByLabel('第 2 条查询类型').selectOption('fliesTo')
  await page.getByLabel('第 2 条起飞宫位').selectOption('命宫')
  await page.getByLabel('第 2 条目标宫位').selectOption('财帛')
  await page.getByRole('button', { name: '运行紫微飞星' }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible()
  expect(body).toMatchObject({ gender: 'female', birthYear: 1990, birthMonth: 1, birthDay: 15, birthHour: 9, queries: [{ type: 'mutagedPlaces', palace: '命宫' }, { type: 'fliesTo', from: '命宫', to: '财帛' }] })
})

test('梅花易数两数报数只发送两项', async ({ page }) => {
  let body: Record<string, unknown> | null = null
  await page.route('**/api/divination/meihua', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: { hexagram: '测试卦' } }) })
  })
  await openTools(page)
  await pickTool(page, 'meihua', '梅花易数')
  await page.getByRole('textbox', { name: '所问之事' }).fill('合作能否谈成？')
  await page.getByLabel('起卦方式').selectOption('number_pair')
  await page.getByLabel('第一数').fill('8')
  await page.getByLabel('第二数').fill('6')
  await expect(page.getByLabel('第三数')).toHaveCount(0)
  await page.getByRole('button', { name: '运行梅花易数' }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible()
  expect(body).toMatchObject({ method: 'number_pair', numbers: [8, 6] })
})

test('小六壬手填农历按钟表时间发送起课参数', async ({ page }) => {
  let body: Record<string, unknown> | null = null
  await page.route('**/api/divination/xiaoliuren', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: { palace: '测试宫' } }) })
  })
  await openTools(page)
  await pickTool(page, 'xiaoliuren', '小六壬')
  await page.getByRole('button', { name: '手填农历' }).click()
  await page.getByLabel('农历月份').fill('3')
  await page.getByLabel('农历日期').fill('15')
  await page.getByLabel('排盘时间').fill('08:30')
  await page.getByRole('button', { name: '运行小六壬' }).click()
  await expect(page.getByRole('heading', { name: '计算结果' })).toBeVisible()
  expect(body).toMatchObject({ lunarMonth: 3, lunarDay: 15, hour: 8, minute: 30, hourType: 'clock' })
  expect(body).not.toHaveProperty('date')
})
