import { discoveredBooks } from './discovered-books.mjs'

const traditionalTitles = {
  葬书: '葬書', 青囊经: '青囊經', 撼龙经: '撼龍經', 疑龙经: '疑龍經', 地理五诀: '地理五訣',
  渊海子平: '淵海子平', 三命通会: '三命通會', 子平真诠: '子平真詮', 穷通宝鉴: '窮通寶鑑',
  增删卜易: '增刪卜易', 梅花易数: '梅花易數', 紫微斗数全书: '紫微斗數全書',
  太乙金镜式经: '太乙金鏡式經', 协纪辨方书: '欽定協紀辨方書 (四庫全書本)',
  御定星历考原: '御定星歷考原', 神相全编: '神相全編', 说文解字: '說文解字',
  宅经: '宅經', 天玉经: '天玉經', 青囊奥语: '青囊奧語', 五行精纪: '五行精紀',
  入地眼全书: '入地眼全書', 玉匣记: '玉匣記', 人伦大统赋: '人倫大統賦',
  尔雅: '爾雅', 释名: '釋名', 广韵: '廣韻', 玉篇: '玉篇',
}

const coreBooks = [
  ['zhouyi', '周易', '佚名', '先秦', '易学', '六十四卦卦爻辞与易传，是易学义理、象数和占筮传统的共同原典。'],
  ['yilin', '易林', '焦延寿', '汉', '易学', '以六十四卦变占系辞保存汉代象数与占验材料。'],
  ['huozhulin', '火珠林', '旧题麻衣道者', '宋以前', '占筮', '纳甲筮法的重要早期文本，涉及六亲、世应与干支装卦。'],
  ['zangshu', '葬书', '旧题郭璞', '晋', '堪舆', '围绕生气、藏风得水、势与形展开的堪舆重要文献。'],
  ['qingnangjing', '青囊经', '佚名', '古代', '堪舆', '后世堪舆传统反复引用的短篇经典，传本与解释流派众多。'],
  ['hanlongjing', '撼龙经', '旧题杨筠松', '唐', '堪舆', '以星峰、龙脉和形势为核心的传统地理歌诀。'],
  ['yilongjing', '疑龙经', '旧题杨筠松', '唐', '堪舆', '论辨龙、察势与寻穴方法，常与撼龙经合读。'],
  ['diliwujue', '地理五诀', '赵九峰', '清', '堪舆', '按龙、穴、砂、水、向组织形势与三合水法。'],
  ['zhaijing', '宅经', '作者待考', '古代', '堪舆', '讨论宅舍形势、方位与营建宜忌的早期阳宅文献。'],
  ['tianyujing', '天玉经', '旧题杨筠松', '唐以后', '堪舆', '三元、玄空等后世地理传统反复诠释的重要歌诀。'],
  ['qingnangaoyu', '青囊奥语', '旧题杨筠松', '唐以后', '堪舆', '以简短歌诀讨论阴阳、雌雄、方位与理气，注解体系众多。'],
  ['rudiyan', '入地眼全书', '辜托长老', '清', '堪舆', '综合龙穴砂水、形势与地理判断的堪舆资料。'],
  ['yuanhaiziping', '渊海子平', '徐大升编', '宋元', '子平', '汇集干支、十神、格局、诗诀与命例的子平重要文献。'],
  ['sanmingtonghui', '三命通会', '万民英', '明', '子平', '综合明代以前命理资料，涵盖格局、神煞、纳音和大量命例。'],
  ['ditiansui', '滴天髓', '旧题京图', '明清', '子平', '以精炼原文讨论天干地支、体用、源流和命局结构，后世注本影响广。'],
  ['zipingzhenquan', '子平真诠', '沈孝瞻', '清', '子平', '围绕月令取格、成败救应建立系统格局法。'],
  ['qiongtongbaojian', '穷通宝鉴', '余春台编', '清', '子平', '按十干十二月讨论寒暖燥湿与调候取用。'],
  ['shenfengtongkao', '神峰通考', '张楠', '明', '子平', '包含命理总论、病药说、格局与命例，是明代子平资料的重要汇编。'],
  ['wuxingjingji', '五行精纪', '廖中', '宋', '子平', '汇集五行、禄命、神煞和前代命书材料的重要宋代文献。'],
  ['zengshanbuyi', '增删卜易', '野鹤老人', '清', '占筮', '以大量占例说明六爻用神、旺衰、动变、空破和应期。'],
  ['bushizhengzong', '卜筮正宗', '王洪绪', '清', '占筮', '系统整理纳甲六爻的装卦、用神、断法与歌诀。'],
  ['meihuayishu', '梅花易数', '旧题邵雍', '宋以后', '占筮', '时间、数字与物象起卦及体用互变传统的核心文本。'],
  ['ziweidoushu', '紫微斗数全书', '旧题陈希夷', '明清传本', '斗数', '保存安星法、星曜赋、十二宫断与格局歌诀的斗数资料。'],
  ['taiyijinjing', '太乙金镜式经', '王希明', '唐', '三式', '太乙式盘、局数、主客算与相关格局的重要文献。'],
  ['liurendaquan', '六壬大全', '明清编纂', '明清', '三式', '汇集大六壬天地盘、四课三传、课体与类神判断资料。'],
  ['xiejibianfangshu', '协纪辨方书', '允禄等奉敕编', '清', '择日', '清代官方择日汇编，整理历法、神煞、建除、宜忌与辨伪。'],
  ['xinglikaoyuan', '御定星历考原', '清代官修', '清', '择日', '讨论历法、星度、选择与相关术数源流的官修资料。'],
  ['yuxiaji', '玉匣记', '旧题许真人', '古代传本', '择日', '汇集通书、民俗择日和日用宜忌的传统资料，版本差异较大。'],
  ['mayishenxiang', '麻衣神相', '旧题麻衣道者', '宋以后', '相法', '传统面相、形神、五官、十二宫与气色资料汇编。'],
  ['shenxiangquanbian', '神相全编', '旧题陈抟等', '明清传本', '相法', '汇集面相、手相、形体、声音与相法歌诀。'],
  ['renlundatongfu', '人伦大统赋', '张行简', '金', '相法', '以赋体保存传统人物观察与相法术语，需结合时代语境阅读。'],
  ['shuowenjiezi', '说文解字', '许慎', '汉', '文字', '以小篆部首体系解释字形字义，是姓名文字考据的重要基础工具。'],
  ['kangxizidian', '康熙字典', '张玉书等奉敕编', '清', '文字', '传统字书与笔画检索的重要来源，姓名学引用时仍需说明笔画口径。'],
  ['erya', '尔雅', '佚名', '先秦至汉', '文字', '中国早期训诂与名物分类经典，是古义检索的重要入口。'],
  ['shiming', '释名', '刘熙', '汉', '文字', '以声训方式解释事物名称，适合与说文及现代训诂研究对读。'],
  ['guangyun', '广韵', '陈彭年等', '宋', '文字', '中古汉语韵书，保存反切、韵部与大量字义资料。'],
  ['yupian', '玉篇', '顾野王', '梁', '文字', '按部首编排的早期字书，是字形字义与书目考据资料。'],
].map(([id, title, author, era, category, summary]) => ({
  id,
  title,
  author,
  era,
  category,
  summary,
  status: 'public-domain',
  sourceName: '维基文库',
  sourceTitle: traditionalTitles[title] || title,
  sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(traditionalTitles[title] || title)}`,
  license: '原始古籍公版；数字文本依来源站许可使用，引用时请保留来源。',
}))

const coreTitles = new Set(coreBooks.flatMap((book) => [book.title, book.sourceTitle]))
const discoveredCatalog = discoveredBooks
  .filter((book) => !coreTitles.has(book.title))
  .map((book, index) => ({
    id: `discovered-${index + 1}`,
    title: book.title,
    author: '作者待考',
    era: '版本待考',
    category: book.category,
    summary: `公开文库主题扫描发现的公版页面，来源页约 ${Number(book.wordCount || 0).toLocaleString('zh-CN')} 字。`,
    status: 'public-domain-discovered',
    sourceName: '维基文库',
    sourceTitle: book.title,
    sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(book.title)}`,
    license: '原始文献公版；数字文本依来源站许可使用。作者、时代与版本信息尚待人工校勘。',
  }))

const publicScans = [
  ['scan-bazhaimingjing', '八宅明镜', '箬冠道人', '清', '堪舆', '20260507_20260507_0702'],
  ['scan-xuexinfu', '雪心赋', '卜应天', '唐宋传本', '堪舆', '20260509_20260509_0800'],
  ['scan-yuchijing', '玉尺经', '旧题刘秉忠', '元以后', '堪舆', '02094302.cn'],
  ['scan-daliurenzhinan', '大六壬指南', '陈公献', '明', '三式', '20210924_20210924_0419'],
  ['scan-taiyitongzong', '太乙统宗宝鉴', '晓山老人', '明清', '三式', '02094400.cn'],
  ['scan-jiyun', '集韵', '丁度等', '宋', '文字', 'nlc-892-412004000251-401912'],
].map(([id, title, author, era, category, identifier]) => ({
  id, title, author, era, category,
  summary: '第二公开来源确认的古籍扫描件。影印页保留版本形态，但暂不提供站内纯文本搜索。',
  status: 'public-domain-scan',
  sourceName: 'Internet Archive',
  sourceTitle: title,
  sourceUrl: `https://archive.org/details/${identifier}`,
  license: '原始古籍公版；扫描件的使用条件以来源页面标注为准。',
}))

export const bookCatalog = [...coreBooks, ...discoveredCatalog, ...publicScans]
