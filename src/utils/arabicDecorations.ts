import { DecorationStyle } from '../types/keyboard';

// Helper to check non-connector Arabic letters
const NON_CONNECTORS = ['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', ' '];

function insertBetweenLetters(text: string, glue: string): string {
  return text.split('').map((char, i, arr) => {
    if (char === ' ' || i === arr.length - 1) return char;
    if (NON_CONNECTORS.includes(char)) return char;
    return char + glue;
  }).join('');
}

export const ARABIC_DECORATIONS: DecorationStyle[] = [
  {
    id: '0',
    num: 0,
    name: 'بدون زخرفة',
    previewSample: 'ريمو كيبورد',
    transform: (t) => t
  },
  {
    id: '1',
    num: 1,
    name: '1- زَّخْرَفَةُ الْكِتَابَةِ',
    previewSample: 'رَّيـْـمُــوْ كِـيـْبُـوْرْد',
    transform: (t) => {
      const marks = ['َّ', 'ْ', 'ُ', 'ِ', 'َ', 'ٍ', 'ٌ'];
      return t.split('').map((c, i) => c === ' ' ? ' ' : c + marks[i % marks.length]).join('');
    }
  },
  {
    id: '2',
    num: 2,
    name: '2- رَّخـ,ـرفـ,ـة آلـ,ـكـ,ـتـ,ـآبـ,ـة',
    previewSample: 'رَّيـ,ـمـ,ـو آلـ,ـكـ,ـيـ,ـبـ,ـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ,ـ')
  },
  {
    id: '3',
    num: 3,
    name: '3- زَخْرَفَةُ الْكِتَابَةِ',
    previewSample: 'رَيـْمـُو الْكِـيـْبـُورْد',
    transform: (t) => {
      const marks = ['َ', 'ْ', 'ُ', 'ِ', 'َ'];
      return t.split('').map((c, i) => c === ' ' ? ' ' : c + marks[i % marks.length]).join('');
    }
  },
  {
    id: '4',
    num: 4,
    name: '4- زَخْرفَةُ آلْكِتَآبَةّ',
    previewSample: 'رَيْـمُو آلْكِـتَآبَةّ',
    transform: (t) => {
      return t.replace(/ا/g, 'آ').split('').map((c, i) => i % 2 === 0 ? c + 'ْ' : c + 'َ').join('') + 'ّ';
    }
  },
  {
    id: '5',
    num: 5,
    name: '5- زَخِرَفَةُ الْكِتَأبَةٌ',
    previewSample: 'رَخِرَفَةُ الْكِتَأبَةٌ',
    transform: (t) => {
      return t.replace(/ا/g, 'أ').split('').map((c, i) => i % 3 === 0 ? c + 'ِ' : c + 'َ').join('') + 'ٌ';
    }
  },
  {
    id: '6',
    num: 6,
    name: '6- زَخُـ رفَةُ آلْكِتَابَة',
    previewSample: 'رَخُـ رفَةُ آلْكِتَابَة',
    transform: (t) => {
      return t.replace(/ا/g, 'آ').split('').map((c, i) => i % 2 === 0 ? c + 'ُـ ' : c).join('');
    }
  },
  {
    id: '7',
    num: 7,
    name: '7- زّخـ❤️ـرفـ❤️ـة آلـكـ❤️ـتـ❤️ـآبـ❤️ـة',
    previewSample: 'رّيـ❤️ـمـ❤️ـو آلـكـ❤️ـيـ❤️ـبـ❤️ـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ❤️ـ')
  },
  {
    id: '8',
    num: 8,
    name: '8- زَّخـےـرفـےـةُ آلـكـےـتـےـآبـےـة',
    previewSample: 'رَّيـےـمـےـو آلـكـےـيـےـبـےـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـےـ')
  },
  {
    id: '9',
    num: 9,
    name: "9- زُخْـ'ـرُفَـ'ـةُ اُلْـ'ـكُـ'ـتُـ'ـاُبَـ'ـةُ",
    previewSample: "رُيـْـ'ـمُـ'ـو اُلـ'ـكـ'ـيـ'ـبـ'ـورد",
    transform: (t) => insertBetweenLetters(t, "ـ'ـ")
  },
  {
    id: '10',
    num: 10,
    name: '10- رَخِبِرفَةُ الْكِتَابَةِ',
    previewSample: 'رَخِبِرفَةُ الْكِتَابَةِ',
    transform: (t) => t.split('').map((c) => c === ' ' ? ' ' : c + 'ِبِ').join('')
  },
  {
    id: '11',
    num: 11,
    name: '11- أنجليزي معرب (عربيزي)',
    previewSample: 'Remo Keyboard (3rabyzy)',
    transform: (t) => {
      const francoMap: Record<string, string> = {
        'ع': '3', 'ح': '7', 'خ': '5', 'ط': '6', 'ق': '9', 'ص': '9\'', 'ض': '9\'',
        'غ': '3\'', 'ء': '2', 'أ': '2', 'إ': '2', 'ش': 'sh', 'ث': 'th', 'ذ': 'th'
      };
      return t.split('').map((c) => francoMap[c] || c).join('');
    }
  },
  {
    id: '12',
    num: 12,
    name: '12- زخـرفـهـة آلـكـهـتـآبـهـة',
    previewSample: 'ريـهـمـهـو آلـكـهـيـهـبـهـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـهـ')
  },
  {
    id: '13',
    num: 13,
    name: '13- زخرفة الأسماء الملكية ꧁꧂',
    previewSample: '꧁ ༒ ريمو كيبورد ༒ ꧂',
    transform: (t) => `꧁ ༒ ${t} ༒ ꧂`
  },
  {
    id: '14',
    num: 14,
    name: '14- زخرفة الأقواس والرموز ⦅⦆',
    previewSample: '⦅ ❖ ريمو كيبورد ❖ ⦆',
    transform: (t) => `⦅ ❖ ${t} ❖ ⦆`
  },
  {
    id: '15',
    num: 15,
    name: '15- زَّخْـۖـرَفَـۗـةُ الْـۘـكِـۖـتَـۗـابَـۘـةُ',
    previewSample: 'رَّيـْـۖـمُـۗـوْ الـۘـكِـۖـيـۗـبُـۘـوْرْد',
    transform: (t) => {
      const quranic = ['ـۖـ', 'ـۗـ', 'ـۘـ', 'ـۙـ', 'ـۚـ', 'ـۛـ'];
      return insertBetweenLetters(t, quranic[Math.floor(Math.random() * quranic.length)])
    }
  },
  {
    id: '16',
    num: 16,
    name: '16- زَّخْـۖـرَفَـۗـةُ الْكِـۗـتَابَة',
    previewSample: 'رَّيـْـۖـمُـۗـو الْكِـۗـتَابَة',
    transform: (t) => insertBetweenLetters(t, 'ـۖـ')
  },
  {
    id: '17',
    num: 17,
    name: '17- زخـ💔ـرفـ💔ـهـة آلـكـ💔ـتـ💔ـآبـ💔ـهـة',
    previewSample: 'ريـ💔ـمـ💔ـو آلـكـ💔ـيـ💔ـبـ💔ـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ💔ـ')
  },
  {
    id: '18',
    num: 18,
    name: '18- زخِـرفِة آلـكـِتَـآبِة',
    previewSample: 'ريـِـمـِـو آلـكـِـتـَـآبـِـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـِـ')
  },
  {
    id: '19',
    num: 19,
    name: '19- زُّخـرفَةُ الْكُّتَابَة',
    previewSample: 'رُّيـمـفَةُ الْكُّتَابَة',
    transform: (t) => insertBetweenLetters(t, 'ـُّـ')
  },
  {
    id: '20',
    num: 20,
    name: '20- زُخـرفَةُ الْكِتَابَة',
    previewSample: 'رُيـمـفَةُ الْكِـتَابَة',
    transform: (t) => insertBetweenLetters(t, 'ـُـ')
  },
  {
    id: '21',
    num: 21,
    name: '21- زخـஃـرفـஃـة آلـكـتـآبـஃـة',
    previewSample: 'ريـஃـمـஃـو آلـكـتـآبـஃـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـஃـ')
  },
  {
    id: '22',
    num: 22,
    name: '22- زخـرفـهـهـہ آلـكـتـآبـهـهـہ',
    previewSample: 'ريـمـهـہ آلـكـتـآبـهـہ',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـهـہ')
  },
  {
    id: '23',
    num: 23,
    name: '23- زخـۖـرفـۗـةُ آلـكـۖـتـۗـآبـۖـة',
    previewSample: 'ريـۖـمـۗـو آلـكـۖـتـۗـآبـۖـة',
    transform: (t) => {
      let toggle = false;
      return t.split('').map((char, i, arr) => {
        if (char === ' ' || i === arr.length - 1 || NON_CONNECTORS.includes(char)) return char;
        toggle = !toggle;
        return char + (toggle ? 'ـۖـ' : 'ـۗـ');
      }).join('');
    }
  },
  {
    id: '24',
    num: 24,
    name: '24- ༊زخـرفـة آلـكـتـابـة༊',
    previewSample: '༊ ريمو كيبورد ༊',
    transform: (t) => `༊ ${insertBetweenLetters(t, 'ـ')} ༊`
  },
  {
    id: '25',
    num: 25,
    name: '25- زِخْـٌـرَفَـٍـةُ الِكْـٌـتَـٍـابَـٌـة',
    previewSample: 'رِخْـٌـمـٍـو الِكْـٌـتَـٍـابَـٌـة',
    transform: (t) => insertBetweenLetters(t, 'ـٌـ')
  },
  {
    id: '26',
    num: 26,
    name: '26- زِخْـُـرَفَـِـةُ الْكِتَابَة',
    previewSample: 'رِخْـُـمـِـو الْكِتَابَة',
    transform: (t) => insertBetweenLetters(t, 'ـُـ')
  },
  {
    id: '27',
    num: 27,
    name: '27- ز خـ ـرفـ ـة الـ ـكـ ـتـ ـابـ ـة',
    previewSample: 'ر يـ ـمـ ـو الـ ـكـ ـيـ ـبـ ـو ر د',
    transform: (t) => insertBetweenLetters(t, 'ـ ـ')
  },
  {
    id: '28',
    num: 28,
    name: '28- زَخِرِفَة آلَكِتَآبَة',
    previewSample: 'رَخِرِفَة آلَكِتَآبَة',
    transform: (t) => t.replace(/ا/g, 'آ').split('').map((c) => c === ' ' ? ' ' : c + 'ِرِ').join('')
  },
  {
    id: '29',
    num: 29,
    name: '29- زَخْرِفَةُ الُكِتَابَةُ',
    previewSample: 'رَيْـمُـو الُكِـتَابَةُ',
    transform: (t) => t.split('').map((c) => c === ' ' ? ' ' : c + 'ْرِ').join('') + 'ُ'
  },
  {
    id: '30',
    num: 30,
    name: '30- رَخٌـرَفَـةُ الُكِـتُابَةُ',
    previewSample: 'رَخٌـرَفَـةُ الُكِـتُابَةُ',
    transform: (t) => insertBetweenLetters(t, 'ـٌـ')
  },
  {
    id: '31',
    num: 31,
    name: '31- زَخـْـرِفـَـة آلـْـكـِـتـَـآبـَـة',
    previewSample: 'رَيْـْـمـِـو آلـْـكـِـيـْـبـَـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـْـ')
  },
  {
    id: '32',
    num: 32,
    name: '32- رُّخِـرفَةُ الْكِـتَابَةُ',
    previewSample: 'رُّيـمـو الْكِـتَابَةُ',
    transform: (t) => insertBetweenLetters(t, 'ـِـ')
  },
  {
    id: '33',
    num: 33,
    name: '33- رَّخِـرفَةُ آلْكِتَآبَةُ',
    previewSample: 'رَّيـمـو آلْكِـتَآبَةُ',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـِـ')
  },
  {
    id: '34',
    num: 34,
    name: '34- رُّخِـرفَةُ آلْكِـتَابَةُ',
    previewSample: 'رُّيـخِـمـو الْكِـتَابَةُ',
    transform: (t) => insertBetweenLetters(t, 'ـِـ')
  },
  {
    id: '35',
    num: 35,
    name: '35- زَّخْـۜـرَفَـۛـةُ الْكِـۜـتَـۛـابَـۜـةُ',
    previewSample: 'رَّيـۜـمـۛـو الْكِـۜـتَـۛـابَـۜـةُ',
    transform: (t) => {
      let alt = false;
      return t.split('').map((char, i, arr) => {
        if (char === ' ' || i === arr.length - 1 || NON_CONNECTORS.includes(char)) return char;
        alt = !alt;
        return char + (alt ? 'ـۜـ' : 'ـۛـ');
      }).join('');
    }
  },
  {
    id: '36',
    num: 36,
    name: '36- زّخـعـرفـعـة آلـكـعـتـعـآبـعـة',
    previewSample: 'ريـعـمـعـو آلـكـعـيـعـبـعـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـعـ')
  },
  {
    id: '37',
    num: 37,
    name: '37- زّخـ=ـرفـ=ـة آلـكـ=ـتـ=ـآبـ=ـة',
    previewSample: 'ريـ=ـمـ=ـو آلـكـ=ـيـ=ـبـ=ـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ=ـ')
  },
  {
    id: '38',
    num: 38,
    name: '38- زخـ☘️ـرفة آلـكـتـآبـ☘️ـة',
    previewSample: 'ريـ☘️ـمـ☘️ـو آلـكـتـآبـ☘️ـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ☘️ـ')
  },
  {
    id: '39',
    num: 39,
    name: '39- زّخـ⁂ـرفـ⁂ـة آلـكـ⁂ـتـ⁂ـآبـ⁂ـة',
    previewSample: 'ريـ⁂ـمـ⁂ـو آلـكـ⁂ـتـ⁂ـآبـ⁂ـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ⁂ـ')
  },
  {
    id: '40',
    num: 40,
    name: '40- زّخـ❀ـرفـ❀ـة آلـكـ❀ـتـ❀ـآبـ❀ـة',
    previewSample: 'ريـ❀ـمـ❀ـو آلـكـ❀ـتـ❀ـآبـ❀ـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ❀ـ')
  },
  {
    id: '41',
    num: 41,
    name: '41- ꧁ ༺ زخرفة الأجنحة الملكية ༻ ꧂',
    previewSample: '꧁ ༺ ريمو كيبورد ༻ ꧂',
    transform: (t) => `꧁ ༺ ${t} ༻ ꧂`
  },
  {
    id: '42',
    num: 42,
    name: '42- ۞ زخرفة المحاريب والمساجد ۞',
    previewSample: '۞ ريمو كيبورد ۞',
    transform: (t) => `۞ ${t} ۞`
  },
  {
    id: '43',
    num: 43,
    name: '43- ⚔️ 彡 زخرفة الفرسان والهيبة 彡 ⚔️',
    previewSample: '⚔️ 彡 ريمو كيبورد 彡 ⚔️',
    transform: (t) => `⚔️ 彡 ${t} 彡 ⚔️`
  },
  {
    id: '44',
    num: 44,
    name: '44- 👑 𓆩 زخرفة التاج الملكي 𓆪 👑',
    previewSample: '👑 𓆩 ريمو كيبورد 𓆪 👑',
    transform: (t) => `👑 𓆩 ${t} 𓆪 👑`
  },
  {
    id: '45',
    num: 45,
    name: '45- 💎 ✧ زخرفة الألماس والبريق ✧ 💎',
    previewSample: '💎 ✧ ريمو كيبورد ✧ 💎',
    transform: (t) => `💎 ✧ ${t} ✧ 💎`
  },
  {
    id: '46',
    num: 46,
    name: '46- ☾ ⋆ زخرفة هلال السماء والنجوم ⋆ ☽',
    previewSample: '☾ ⋆ ريمو كيبورد ⋆ ☽',
    transform: (t) => `☾ ⋆ ${t} ⋆ ☽`
  },
  {
    id: '47',
    num: 47,
    name: '47- 🦋 ✿ زخرفة الفراشات والزهور ✿ 🦋',
    previewSample: '🦋 ✿ ريمو كيبورد ✿ 🦋',
    transform: (t) => `🦋 ✿ ${t} ✿ 🦋`
  },
  {
    id: '48',
    num: 48,
    name: '48- 【 زخرفة الأقواس الصينية الكثيفة 】',
    previewSample: '【 ريمو كيبورد 】',
    transform: (t) => `【 ${t} 】`
  },
  {
    id: '49',
    num: 49,
    name: '49- ⟦ زخرفة الأقواس المزدوجة العريضة ⟧',
    previewSample: '⟦ ${t} ⟧',
    transform: (t) => `⟦ ${t} ⟧`
  },
  {
    id: '50',
    num: 50,
    name: '50- ر ▫ ي ▫ م ▫ و (تباعد المربعات البيضاء)',
    previewSample: 'ر ▫ ي ▫ م ▫ و   ك ▫ ي ▫ ب ▫ و ▫ ر ▫ د',
    transform: (t) => t.split('').map((c) => c === ' ' ? '   ' : c + ' ▫ ').join('').trim()
  },
  {
    id: '51',
    num: 51,
    name: '51- ر ✦ ي ✦ م ✦ و (نجوم التباعد الماسية)',
    previewSample: 'ر ✦ ي ✦ م ✦ و',
    transform: (t) => t.split('').map((c) => c === ' ' ? '   ' : c + ' ✦ ').join('').trim()
  },
  {
    id: '52',
    num: 52,
    name: '52- ░▒▓█ زخرفة الكتل النيون الرقمية █▓▒░',
    previewSample: '░▒▓█ ريمو كيبورد █▓▒░',
    transform: (t) => `░▒▓█ ${t} █▓▒░`
  },
  {
    id: '53',
    num: 53,
    name: '53- (¯`•._.• زخرفة القلوب التراثية •._.•´¯)',
    previewSample: '(¯`•._.• ريمو كيبورد •._.•´¯)',
    transform: (t) => `(¯\`•._.• ${t} •._.•´¯)`
  },
  {
    id: '54',
    num: 54,
    name: '54- •.¸¸.•´´¯`••._.• زخرفة الأمواج •._.••`´¯`•.¸¸.•',
    previewSample: '•.¸¸.•´´¯`••._.• ريمو كيبورد •._.••`´¯`•.¸¸.•',
    transform: (t) => `•.¸¸.•´´¯\`••._.• ${t} •._.••\`´¯\`•.¸¸.•`
  },
  {
    id: '55',
    num: 55,
    name: '55- زّخـ★ـرفـ★ـة آلـكـ★ـتـ★ـآبـ★ـة',
    previewSample: 'ريـ★ـمـ★ـو آلـكـ★ـيـ★ـبـ★ـورد',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ★ـ')
  },
  {
    id: '56',
    num: 56,
    name: '56- زّخـ⚜️ـرفـ⚜️ـة آلـكـ⚜️ـتـ⚜️ـآبـ⚜️ـة',
    previewSample: 'ريـ⚜️ـمـ⚜️ـو آلـكـ⚜️ـتـ⚜️ـآبـ⚜️ـة',
    transform: (t) => insertBetweenLetters(t.replace(/ا/g, 'آ'), 'ـ⚜️ـ')
  },
  {
    id: '57',
    num: 57,
    name: '57- رٍيـِـِـِمـِـِـِو (زخرفة الصدى والمدود التحتية)',
    previewSample: 'رٍيـِـِـِمـِـِـِو كـِـِـِيـِـِـِبـِـِـِوّرد',
    transform: (t) => insertBetweenLetters(t, 'ـِـِـِ')
  },
  {
    id: '58',
    num: 58,
    name: '58- رُيـُـُـُمـُـُـُو (زخرفة الصدى والضمة العلوية)',
    previewSample: 'رُيـُـُـُمـُـُـُو كـُـُـُيـُـُـُبـُـُـُوّرد',
    transform: (t) => insertBetweenLetters(t, 'ـُـُـُ')
  },
  {
    id: '59',
    num: 59,
    name: '59- 🏮 ⤹ زخرفة الفوانيس الشرقية ⤸ 🏮',
    previewSample: '🏮 ⤹ ريمو كيبورد ⤸ 🏮',
    transform: (t) => `🏮 ⤹ ${t} ⤸ 🏮`
  },
  {
    id: '60',
    num: 60,
    name: '60- ⚜️ ⫷ الملكية الفاخرة للأسماء ⫸ ⚜️',
    previewSample: '⚜️ ⫷ ريمو كيبورد ⫸ ⚜️',
    transform: (t) => `⚜️ ⫷ ${t} ⫸ ⚜️`
  }
];
