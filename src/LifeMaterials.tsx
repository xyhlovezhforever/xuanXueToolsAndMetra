import type { LifeView } from './WorkspaceViews'

type Article = { title: string; idea: string; action: string; check: string }

const materials: Record<LifeView, Article[]> = {
  flow: [
    { title: '先定义一个可完成的任务', idea: '专注时段适合处理边界清楚的工作。目标太大时，开始和结束都难以判断。', action: '把“写方案”改成“完成方案的目录和第一节草稿”。', check: '计时结束时，能否说出已经交付了什么？' },
    { title: '让反馈尽快出现', idea: '写作、设计和学习都可以拆成短周期：做一小段，查看结果，再决定下一步。', action: '每完成一个小步骤，就记录一个可见结果或待解决的问题。', check: '下一轮开始前，是否知道要改进什么？' },
    { title: '把分心留到时段之后', idea: '突然想到的待办无需马上处理。记录下来，再回到当前任务。', action: '将新想法放进下方的“稍后处理”清单，结束时再整理。', check: '哪些打断其实可以等到休息时？' },
  ],
  declutter: [
    { title: '按用途决定去留', idea: '先看物品是否仍有明确用途，再看使用频率和取得难度。', action: '把待定物品放到固定位置，写下下次评估日期。', check: '留它是因为会用，还是因为不想作决定？' },
    { title: '先减少，再收纳', idea: '收纳盒只能改变物品的位置，不能减少维护成本。', action: '逐个区域完成“保留、转赠、回收、待定”四类，再决定需要多少容器。', check: '常用物是否能在固定位置快速找到？' },
    { title: '数字空间也需要清理', idea: '文件、订阅和通知会持续占用检索时间与注意力。', action: '先处理下载目录，再关闭无用通知，最后整理常用文件夹。', check: '最常查找的文件是否有稳定命名和位置？' },
  ],
  fengshui: [
    { title: '观察自然光与眩光', idea: '空间是否舒适，要看人在实际使用位置的感受，而不只看房间朝向。', action: '分别在早、中、晚坐到常用位置，记录亮度和屏幕反光。', check: '补光、遮光或挪动座位，哪一步最容易先试？' },
    { title: '给动线留出余地', idea: '门口、通道和常用家具之间的空间，会影响日常走动和清洁。', action: '从入口走到常用位置，标出需要侧身或绕行的地方。', check: '是否能把阻碍物移到更稳定的收纳位置？' },
    { title: '从空气与噪声着手', idea: '通风、异味和持续噪声比装饰细节更直接影响空间体验。', action: '记录问题出现的时段与位置，再试一次小范围调整。', check: '调整后，同一时段的感受是否有变化？' },
  ],
  emotion: [
    { title: '先写感受，再选形式', idea: '“温暖”或“平静”需要落实到使用场景，才能指导材料、颜色和尺寸。', action: '写一句“谁在什么时刻使用它，希望感到什么”。', check: '设计草稿能否让别人理解这句话？' },
    { title: '让感官线索一致', idea: '颜色、触感、声音和文字可以共同传达情绪；冲突的线索会削弱表达。', action: '先选主色和辅助色，再检查材料与文字语气是否协调。', check: '去掉品牌名后，物件仍传达目标感受吗？' },
    { title: '用低成本样品验证', idea: '草稿中的预期与真实触感、尺寸常有差异。', action: '用纸样、色卡或简单模型做一次实际使用测试。', check: '使用者描述的感受是否接近设计目标？' },
  ],
  learning: [
    { title: '把主题变成可检验的问题', idea: '“一起学习”需要共同的讨论对象和可观察的成果。', action: '约定本周要回答的一个问题，以及各自带来的一个例子。', check: '讨论结束时，能否共同写出暂时的答案？' },
    { title: '用回忆检查理解', idea: '读完资料后，尝试不看原文说明要点，比反复浏览更容易发现理解空白。', action: '各自写下三个要点、一个疑问，再对照原文核查。', check: '哪些内容说不清，需要回去查证？' },
    { title: '让复盘进入下一轮', idea: '共学记录应留下明确的下一步，而不只留下参与感。', action: '每次结束时写下下一次主题、负责人和最小准备任务。', check: '到下次见面前，每个人知道自己要做什么吗？' },
  ],
}

export default function LifeMaterials({ view }: { view: LifeView }) {
  return <section className="life-materials" aria-label="实践资料">
    <div className="life-list-heading"><h2>实践资料</h2><span>{materials[view].length} 篇</span></div>
    <div className="life-material-list">{materials[view].map((article, index) => <details key={article.title}>
      <summary><span>{String(index + 1).padStart(2, '0')}</span><b>{article.title}</b></summary>
      <div><p>{article.idea}</p><p><strong>试一试</strong>{article.action}</p><p><strong>回看</strong>{article.check}</p></div>
    </details>)}</div>
  </section>
}
