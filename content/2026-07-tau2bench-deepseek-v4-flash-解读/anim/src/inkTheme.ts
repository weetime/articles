// 水墨风格主题:宣纸 + 墨 + 朱砂 + 石绿 + 靛青
export const K = {
  paper: '#ece2cd',      // 宣纸底
  paper2: '#e4d8bd',     // 纸的深处(晕染)
  ink: '#23201a',        // 浓墨(主文字)
  ink2: '#4d463a',       // 淡墨
  ink3: '#8b8069',       // 枯墨(注释)
  ink4: '#a89c82',       // 最淡
  seal: '#b23a2c',       // 朱砂(印章/强调/失败)
  sealDeep: '#8f2c21',
  green: '#5f7a4e',      // 石绿(成功/通过)
  greenDeep: '#4a6140',
  indigo: '#3a5568',     // 靛青(第二数据色)
  indigoLight: '#5c7a8c',
  line: '#c9bda1',       // 淡墨界格线
};

// 系统毛笔/楷书字体(macOS 自带,CSP 不阻断本地字体)
export const F_TITLE = '"Xingkai SC","STXingkai","Weibei SC","Kaiti SC","STKaiti",serif'; // 行楷标题
export const F_BODY = '"Kaiti SC","STKaiti","Songti SC",serif';                            // 楷书正文
export const F_NUM = '"Songti SC","STSong","Kaiti SC",serif';                              // 宋体数字
