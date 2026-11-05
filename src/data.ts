import {
  Compass,
  Kanban,
  Mountains,
  Scroll,
  Sparkle,
  YinYang,
  type Icon,
} from '@phosphor-icons/react'
import { expandedReferences } from './expandedData'

export type CategoryId = 'all' | 'foundation' | 'fengshui' | 'bazi' | 'ziwei' | 'divination' | 'sanshi' | 'zeri' | 'xiangfa' | 'naming' | 'classics' | 'western' | 'practice'

export interface Category {
  id: CategoryId
  label: string
  description: string
  icon: Icon
}

export interface ReferenceSection {
  heading: string
  body: string
}

export interface ReferenceEntry {
  id: string
  category: Exclude<CategoryId, 'all'>
  title: string
  summary: string
  source: string
  school: string
  level: '入门' | '进阶' | '查表'
  readTime: number
  tags: string[]
  sections: ReferenceSection[]
}

export const categories: Category[] = [
  { id: 'all', label: '全部资料', description: '跨体系检索', icon: Kanban },
  { id: 'foundation', label: '易学基础', description: '阴阳、五行、象数', icon: YinYang },
  { id: 'fengshui', label: '风水理气', description: '峦头、罗盘、理气', icon: Mountains },
  { id: 'bazi', label: '八字子平', description: '四柱、十神、运限', icon: YinYang },
  { id: 'ziwei', label: '紫微斗数', description: '星曜、宫位、四化', icon: Sparkle },
  { id: 'divination', label: '筮法占卜', description: '六爻、梅花、卦法', icon: Sparkle },
  { id: 'sanshi', label: '奇门三式', description: '奇门、六壬、太乙', icon: Compass },
  { id: 'zeri', label: '择日历法', description: '黄历、建除、冲煞', icon: Compass },
  { id: 'xiangfa', label: '相法杂项', description: '面相、手相、骨相', icon: Scroll },
  { id: 'naming', label: '姓名文字', description: '字义、音形、五格', icon: Scroll },
  { id: 'classics', label: '经典索引', description: '原典、注本、版本', icon: Scroll },
  { id: 'western', label: '西方术数', description: '占星、塔罗、数字', icon: Sparkle },
  { id: 'practice', label: '实务规范', description: '案卷、伦理、核验', icon: Kanban },
]

export const references: ReferenceEntry[] = [
  {
    id: 'luantou-xingshi', category: 'fengshui', title: '峦头与形势观察',
    summary: '从龙、穴、砂、水、向建立现场记录顺序，先辨形势，再谈理气。',
    source: '《葬书》《地理五诀》', school: '形势派', level: '入门', readTime: 8,
    tags: ['龙穴砂水', '现场勘察', '形势'],
    sections: [
      { heading: '观察顺序', body: '先看大环境来龙与水口，再看近身护砂、明堂与穴场。记录时把“所见事实”和“流派判断”分开，避免先入为主。' },
      { heading: '核心坐标', body: '龙看起伏与止聚，穴看承接与藏聚，砂看环护与有情，水看来去与收束，向则在形势成立后再定。' },
      { heading: '使用边界', body: '照片和卫星图适合初筛，不能替代坡度、风口、噪声、排水与建筑结构的现场核验。' },
    ],
  },
  {
    id: 'san-yuan-jiu-yun', category: 'fengshui', title: '三元九运时间框架',
    summary: '整理上中下三元、九运划分与应用时应先确认的立极、建造和换运条件。',
    source: '三元理气相关典籍', school: '三元派', level: '进阶', readTime: 9,
    tags: ['九运', '元运', '时间'],
    sections: [
      { heading: '基本结构', body: '一元六十年，三元共一百八十年；每运二十年。应用时必须明确采用的历法边界与换运规则。' },
      { heading: '先核对什么', body: '建筑竣工、首次使用、重大重建和长期空置后的再启用，可能影响所取运盘。不同传承口径并不完全一致，应注明。' },
      { heading: '避免混用', body: '三元九运是时间坐标，不等于单凭当运数字即可判断住宅吉凶，仍需结合坐向、形势与实际使用。' },
    ],
  },
  {
    id: 'xuan-kong-fei-xing', category: 'fengshui', title: '玄空飞星排盘骨架',
    summary: '以运盘、山盘、向盘为三层坐标，整理顺逆飞与九宫阅读的核对清单。',
    source: '玄空理气传承资料', school: '玄空派', level: '进阶', readTime: 12,
    tags: ['飞星', '九宫', '坐向'],
    sections: [
      { heading: '三层盘', body: '运盘提供时间底盘，山盘偏重人丁与静态空间，向盘偏重财气与动态开口。判断前先确认坐向度数与阴阳顺逆。' },
      { heading: '核盘清单', body: '核对运别、坐山、向首、兼向范围、替卦条件与入囚等特殊规则，任何一项口径变化都应写进案卷。' },
      { heading: '落地验证', body: '星盘判断要回到门、路、水、灶、床、办公位和实际动线，并用已发生事件做交叉核验。' },
    ],
  },
  {
    id: 'bazhai-you-nian', category: 'fengshui', title: '八宅游年速查逻辑',
    summary: '区分宅卦、命卦与八方游年，不把“吉方”简化成脱离房屋结构的固定答案。',
    source: '《八宅明镜》及相关传承', school: '八宅派', level: '查表', readTime: 7,
    tags: ['八宅', '命卦', '游年'],
    sections: [
      { heading: '三个对象', body: '宅卦说明住宅坐向系统，命卦说明个人分组，游年则是八方关系。先确定采用宅命配合还是以宅为主的传承。' },
      { heading: '常见误区', body: '同名吉位在不同宅卦中位置不同；门、主、灶的组合也不能只看一个方位标签。' },
      { heading: '记录方法', body: '在平面图上标出太极点、八方、主要开口与长期停留区，再注明所用命卦算法和年份边界。' },
    ],
  },
  {
    id: 'luopan-24shan', category: 'fengshui', title: '罗盘二十四山',
    summary: '将八干、四维、十二支分布到二十四山，作为坐向记录与分金查阅的基础。',
    source: '罗盘通用层盘', school: '通用基础', level: '查表', readTime: 6,
    tags: ['罗盘', '二十四山', '分金'],
    sections: [
      { heading: '基本分布', body: '二十四山每山十五度，以正北子山为中心依次排列。现场应同时记录磁向、测量位置、设备与环境干扰。' },
      { heading: '测量规范', body: '远离钢筋、电器、车辆与强磁物，至少在多个点位复测。度数处于分界附近时要记录误差范围。' },
      { heading: '后续用途', body: '坐向度数是玄空、三合、纳甲等体系的共同输入，但不同体系对兼向和分金的处理规则不同。' },
    ],
  },
  {
    id: 'wuxing-shengke', category: 'foundation', title: '阴阳五行生克制化',
    summary: '把生、克、泄、耗、助放回强弱与时令，不用单一关系直接下结论。',
    source: '命理通用基础', school: '子平基础', level: '入门', readTime: 8,
    tags: ['五行', '生克', '旺衰'],
    sections: [
      { heading: '五种关系', body: '同类为助，生我为印，我生为泄，我克为财，克我为官杀。关系本身中性，吉凶取决于结构与所需。' },
      { heading: '判断顺序', body: '先看月令与根气，再看透干、组合、寒暖燥湿和全局流通。数量多不等于力量一定强。' },
      { heading: '表达规范', body: '写案时区分盘面事实、传统解释与现实建议，避免把象义当作确定事件。' },
    ],
  },
  {
    id: 'tiangan-dizhi', category: 'foundation', title: '天干地支关系表',
    summary: '汇总十干、十二支、藏干、六合三合六冲三刑等基础关系与核对顺序。',
    source: '子平命理通用表', school: '通用基础', level: '查表', readTime: 10,
    tags: ['天干', '地支', '合冲刑害'],
    sections: [
      { heading: '天干关系', body: '十干先分阴阳五行，再看五合、相生与相克。是否合化不能只看两干相见，还需结合时令与全局条件。' },
      { heading: '地支关系', body: '支中藏干决定内在五行，合、冲、刑、害、破是结构关系，不应机械等同于好坏。' },
      { heading: '核对建议', body: '排盘由历法引擎生成，特别注意子时换日、真太阳时、历法类型和夏令时处理。' },
    ],
  },
  {
    id: 'shishen-system', category: 'bazi', title: '十神定位与象义',
    summary: '从日主阴阳生克推导十神，并把人物、事务和心理象义放回具体命局。',
    source: '《子平真诠》《滴天髓》', school: '子平法', level: '入门', readTime: 11,
    tags: ['十神', '日主', '象义'],
    sections: [
      { heading: '推导原则', body: '以日干为我，按五行生克与阴阳同异分为比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印。' },
      { heading: '多层象义', body: '同一十神可对应人物关系、资源方式、行为倾向与事件类型，不能只套一个固定关键词。' },
      { heading: '组合优先', body: '十神之间的制化、位置、透藏与旺衰比单神标签更重要。解读时至少引用两项盘面证据。' },
    ],
  },
  {
    id: 'bazi-workflow', category: 'bazi', title: '四柱分析工作流',
    summary: '从校时、排盘到旺衰、格局、调候、用神与运限，建立可复核的案卷顺序。',
    source: '子平法综合流程', school: '工作方法', level: '进阶', readTime: 14,
    tags: ['八字', '工作流', '用神'],
    sections: [
      { heading: '输入校验', body: '记录公历或农历、是否闰月、出生地、时区、钟表时间和校时口径。任何不确定信息均保留多个候选盘。' },
      { heading: '原局分析', body: '依次观察月令、根气、透干、组合、寒暖燥湿和结构主线，再讨论格局与喜忌。' },
      { heading: '运限核验', body: '大运和流年用于观察结构何时被触发，应结合真实履历回测，不以单一年份标签替代具体分析。' },
    ],
  },
  {
    id: 'ziwei-12palaces', category: 'ziwei', title: '紫微十二宫阅读',
    summary: '以命、兄弟、夫妻、子女、财帛等十二宫为坐标，结合星曜、四化与三方四正。',
    source: '紫微斗数通用盘式', school: '紫微斗数', level: '进阶', readTime: 13,
    tags: ['紫微', '十二宫', '四化'],
    sections: [
      { heading: '宫位是主题', body: '宫位表示观察主题，不等同于固定事件。先看命身与主轴，再看所问事项对应宫位。' },
      { heading: '星曜是语汇', body: '主星、辅曜、煞曜需结合庙旺落陷、同宫会照与四化，不宜孤立解释。' },
      { heading: '时间层次', body: '本命、大限、流年、流月是不同时间层，解读时标清盘层，避免把运限星曜误当成本命结构。' },
    ],
  },
  {
    id: 'bagua-foundation', category: 'foundation', title: '先后天八卦坐标',
    summary: '整理乾兑离震巽坎艮坤的卦象、方位与先后天位置，建立查表基准。',
    source: '《周易》与八卦通用表', school: '易学基础', level: '查表', readTime: 7,
    tags: ['八卦', '方位', '卦象'],
    sections: [
      { heading: '八卦基本象', body: '乾天、兑泽、离火、震雷、巽风、坎水、艮山、坤地。象义来自结构类比，使用时应说明所取层面。' },
      { heading: '两种方位', body: '先天重对待与结构，后天重运行与时空。两套方位图用途不同，不应直接叠成一个判断。' },
      { heading: '阴阳爻', body: '阳爻为连续线，阴爻为中断线；三爻自下而上读取。重卦同样从初爻向上读至上爻。' },
    ],
  },
  {
    id: 'liuyao-yongshen', category: 'divination', title: '六爻用神取用',
    summary: '按占问主题选取父母、兄弟、子孙、妻财、官鬼，并检查世应与旺衰动变。',
    source: '《增删卜易》《卜筮正宗》', school: '纳甲六爻', level: '进阶', readTime: 12,
    tags: ['六爻', '用神', '世应'],
    sections: [
      { heading: '先定问题', body: '一个卦应有清晰问题、对象与时间范围。问题含混时，用神会随解释漂移。' },
      { heading: '常见取用', body: '文书房产取父母，财务与男问感情取妻财，事业诉讼与疾病忧患取官鬼，子女平安取子孙，合作竞争取兄弟。' },
      { heading: '完整判断', body: '取用后还需看月日旺衰、旬空月破、动静生克、世应关系、原神忌神和变爻。盘面必须由算法生成。' },
    ],
  },
  {
    id: 'meihua-tiyong', category: 'divination', title: '梅花易数体用框架',
    summary: '从本卦、互卦、变卦与体用生克构建推演链，保留起卦依据。',
    source: '《梅花易数》', school: '梅花易数', level: '进阶', readTime: 10,
    tags: ['梅花', '体用', '互卦'],
    sections: [
      { heading: '起卦可复现', body: '记录时间、数字、文字或物象的取数规则。相同输入应能得到相同卦盘。' },
      { heading: '体用关系', body: '体代表主体，用代表所问或外部作用；结合五行生克、旺衰与卦象变化判断过程。' },
      { heading: '三层观察', body: '本卦看当下结构，互卦看中间过程，变卦看趋势结果。象义用于组织证据，不代替现实信息。' },
    ],
  },
  {
    id: 'qimen-nine-palaces', category: 'sanshi', title: '奇门九宫读盘顺序',
    summary: '从时空坐标、阴阳遁与局数，依次检查九星、八门、八神和天地盘干。',
    source: '奇门遁甲盘式', school: '时家奇门', level: '进阶', readTime: 15,
    tags: ['奇门', '九宫', '八门'],
    sections: [
      { heading: '排盘输入', body: '至少需要明确日期、时间、时区和所用置闰或拆补等规则。不同排法的盘面不能混合解读。' },
      { heading: '取用落宫', body: '先按问事主题确定用神，再看落宫五行、门星神仪组合、宫间生克与空亡击刑等状态。' },
      { heading: '证据链', body: '结论至少说明用神是谁、落在哪一宫、与日干或时干有什么关系，以及关键格局如何形成。' },
    ],
  },
  {
    id: 'daliuren-sike', category: 'sanshi', title: '大六壬四课三传',
    summary: '以天地盘起四课、发三传，再结合天将、课体与年命形成判断主线。',
    source: '六壬传统课式', school: '大六壬', level: '进阶', readTime: 16,
    tags: ['六壬', '四课', '三传'],
    sections: [
      { heading: '盘面层级', body: '天地盘提供时空关系，四课呈现事体交涉，三传表示初中末的发展链。' },
      { heading: '发用规则', body: '贼克、比用、涉害、遥克、昴星等取传规则有严格次序，应由计算引擎完成并保留课体名。' },
      { heading: '综合判断', body: '结合日辰、旬空、月将、天将、年命与所问类神，不以单一神将或三传字面直接论吉凶。' },
    ],
  },
  {
    id: 'almanac-boundary', category: 'zeri', title: '黄历宜忌使用边界',
    summary: '把通书宜忌视为公共日期筛选，重要择日仍需结合事项、方位与当事人条件。',
    source: '通书与历法资料', school: '择日基础', level: '入门', readTime: 6,
    tags: ['黄历', '宜忌', '择日'],
    sections: [
      { heading: '公共层', body: '每日宜忌、值神、建除和冲煞是公共坐标，适合做初步排除与候选日比较。' },
      { heading: '个体层', body: '婚嫁、动土、安葬、开业等事项所需条件不同，重要事务还要考虑当事人信息、坐向、地域和实际流程。' },
      { heading: '现实优先', body: '法律、安全、天气、施工规范与参与者可行性优先于传统日期标签。' },
    ],
  },
  {
    id: 'jianchu-twelve', category: 'zeri', title: '建除十二神速查',
    summary: '建、除、满、平、定、执、破、危、成、收、开、闭的周期与常用象义。',
    source: '传统通书', school: '择日基础', level: '查表', readTime: 8,
    tags: ['建除', '十二神', '值日'],
    sections: [
      { heading: '十二值日', body: '十二神随月建与日支推移，是择日的一层参考。不同通书对具体事项的宜忌可能存在差异。' },
      { heading: '常用理解', body: '成、开常用于启动与成就类事项，破、闭常用于破除与收束类事项，但需与具体事项及其他历法因素合看。' },
      { heading: '查表提示', body: '使用时记录所查日期、月建、日支、值神与版本来源，避免跨历法口径复制。' },
    ],
  },
  {
    id: 'chongsha-guide', category: 'zeri', title: '冲煞与方位核对',
    summary: '解释日冲生肖与方位煞的来源、适用层级及常见过度解读。',
    source: '传统黄历通用规则', school: '择日基础', level: '入门', readTime: 5,
    tags: ['冲煞', '生肖', '方位'],
    sections: [
      { heading: '日冲', body: '日支与相冲地支形成生肖冲，属于公共日期信息，不等于对应生肖的人当天必然发生不利事件。' },
      { heading: '方位煞', body: '煞方用于提示当日特定方位的传统避忌，涉及动土、出行时仍需结合实际方向和事项。' },
      { heading: '表达方式', body: '对客户说明这是传统筛选因素之一，并给出替代日期或现实风险建议，避免制造不必要恐慌。' },
    ],
  },
  {
    id: 'face-twelve-palaces', category: 'xiangfa', title: '面相十二宫索引',
    summary: '用十二宫作为观察区域索引，同时标记光线、年龄、表情与健康信息的干扰。',
    source: '传统相法资料', school: '面相', level: '查表', readTime: 7,
    tags: ['面相', '十二宫', '观察'],
    sections: [
      { heading: '区域索引', body: '命宫、财帛、兄弟、田宅、男女、奴仆、妻妾、疾厄、迁移、官禄、福德、父母是传统观察区域。' },
      { heading: '动态因素', body: '表情、睡眠、妆容、光线、镜头与年龄都会显著改变外观，不应把单张照片视为稳定特征。' },
      { heading: '伦理边界', body: '不依据外貌推断疾病、犯罪、人格价值或不可改变的命运；咨询内容应尊重隐私与自主选择。' },
    ],
  },
  {
    id: 'palm-three-lines', category: 'xiangfa', title: '手相三大线观察表',
    summary: '整理生命线、智慧线、感情线的位置与记录方法，避免医学化与宿命化表达。',
    source: '传统手相资料', school: '手相', level: '入门', readTime: 6,
    tags: ['手相', '掌纹', '观察'],
    sections: [
      { heading: '记录对象', body: '观察线形、深浅、连续性与左右手差异，记录拍摄时间和手部使用情况。' },
      { heading: '变化因素', body: '劳动、皮肤状态、受伤与年龄会改变掌纹外观，传统象义不能替代医疗判断。' },
      { heading: '咨询表达', body: '把象义作为反思问题的语言，而不是寿命、疾病或事故的确定预测。' },
    ],
  },
  {
    id: 'zhouyi-index', category: 'classics', title: '《周易》阅读索引',
    summary: '区分经、传与历代注疏，按卦辞、爻辞、象传和义理建立阅读路径。',
    source: '《周易》经传', school: '原典', level: '入门', readTime: 12,
    tags: ['周易', '六十四卦', '经传'],
    sections: [
      { heading: '文本层次', body: '经文主要包括六十四卦卦辞与三百八十四爻爻辞，十翼是解释体系的重要组成。版本阅读应标注经传层次。' },
      { heading: '阅读顺序', body: '先熟悉卦象与爻位，再读卦辞、爻辞及象传，最后比较王弼、程颐、朱熹等不同注解取向。' },
      { heading: '引用规范', body: '引用时注明卦名、爻位、原文与版本，不把后世术数解释直接说成经文原义。' },
    ],
  },
  {
    id: 'zangshu-index', category: 'classics', title: '《葬书》概念索引',
    summary: '围绕生气、藏风、得水与形势语言建立原文和后世解释的对照。',
    source: '《葬书》及历代注本', school: '堪舆原典', level: '进阶', readTime: 11,
    tags: ['葬书', '生气', '藏风得水'],
    sections: [
      { heading: '核心概念', body: '文本以气、形、势、水与方位组织论述，“气乘风则散，界水则止”是后世堪舆常引用的核心句。' },
      { heading: '版本意识', body: '《葬书》的作者归属、文本流传与注释体系复杂，研究时应区分原文、注本与现代改写。' },
      { heading: '现代使用', body: '可用于理解传统空间观，但墓地与建设实践必须遵守当地法律、生态与公共卫生要求。' },
    ],
  },
  {
    id: 'ditiansui-index', category: 'classics', title: '《滴天髓》主题索引',
    summary: '按天道、地道、人道、形象、方局、八格与体用梳理子平命理核心命题。',
    source: '《滴天髓》与任铁樵注', school: '子平原典', level: '进阶', readTime: 13,
    tags: ['滴天髓', '体用', '命理经典'],
    sections: [
      { heading: '阅读重点', body: '原文高度凝练，后世常通过命例阐释。应把原文命题、注家解释与命例判断分层记录。' },
      { heading: '结构思想', body: '全书重视气势、清浊、源流与体用，强调命局整体关系，不宜拆成孤立口诀。' },
      { heading: '交叉阅读', body: '可与《子平真诠》《穷通宝鉴》等对照，观察格局、调候与旺衰取法的侧重点差异。' },
    ],
  },
  {
    id: 'ziping-zhenquan', category: 'classics', title: '《子平真诠》格局索引',
    summary: '围绕月令、用神、相神与格局成败梳理章节，保留不同注家的解释差异。',
    source: '《子平真诠》及评注本', school: '子平原典', level: '进阶', readTime: 14,
    tags: ['子平真诠', '格局', '月令'],
    sections: [
      { heading: '月令为纲', body: '书中以月令取用与格局为重要主线，但实际判断仍要结合透藏、制化与全局结构。' },
      { heading: '相神概念', body: '相神用于维护或成就格局。不同现代注本对用神和相神术语的使用不完全一致，应注明所据版本。' },
      { heading: '案例记录', body: '读命例时先复原盘面，再对照注解推理，区分事后叙述与可重复的判断规则。' },
    ],
  },
  ...expandedReferences,
]

export const toolCatalog = [
  { id: 'almanac', name: '黄历查询', group: '历法', description: '查询日期的干支、宜忌、冲煞、值神与方位。', active: true },
  { id: 'bazi', name: '八字命盘', group: '命理', description: '计算四柱、藏干、十神与干支关系。', active: true },
  { id: 'bazi_dayun', name: '八字大运', group: '命理', description: '计算起运、大运与各步流年。', active: true },
  { id: 'bazi_pillars_resolve', name: '四柱反推', group: '命理', description: '由四柱干支反查出生时间区间。', active: true },
  { id: 'ziwei', name: '紫微斗数', group: '命理', description: '十二宫、星曜、四化与大限盘面。', active: true },
  { id: 'ziwei_horoscope', name: '紫微运限', group: '命理', description: '大限、流年、流月与叠宫。', active: true },
  { id: 'ziwei_flying_star', name: '紫微飞星', group: '命理', description: '宫干四化、自化与三方四正查询。', active: true },
  { id: 'liuyao', name: '六爻排卦', group: '占卜', description: '纳甲、世应、六亲、动爻与用神。', active: true },
  { id: 'meihua', name: '梅花易数', group: '占卜', description: '时间、数字与文字起卦的体用推演。', active: true },
  { id: 'qimen', name: '奇门遁甲', group: '三式', description: '九宫、九星、八门、八神与格局。', active: true },
  { id: 'daliuren', name: '大六壬', group: '三式', description: '天地盘、四课、三传、神将与课体。', active: true },
  { id: 'taiyi', name: '太乙', group: '三式', description: '九星观测与七十二局时计。', active: true },
  { id: 'xiaoliuren', name: '小六壬', group: '占卜', description: '按农历月日时起课的速断盘。', active: true },
  { id: 'astrology', name: '西方占星', group: '星盘', description: '本命锚点、主星与流运触发。', active: true },
  { id: 'tarot', name: '塔罗牌阵', group: '占卜', description: '可复现种子的牌阵抽取与象征信息。', active: true },
]
