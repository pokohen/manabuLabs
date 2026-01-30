export interface StudyMenu {
  path: string
  label: string
  description: string
}

export const STUDY_MENUS: StudyMenu[] = [
  { path: '/base-study', label: '히라가나/가타카나', description: '기초 문자 학습' },
  { path: '/grammar-study', label: '문법 공부', description: '동사, 형용사, 조사 학습' },
  { path: '/kanji-study', label: '한자 공부', description: '한자 획순 및 읽기 학습' },
  { path: '/word-sentence', label: '예시 문장 보기', description: 'AI 기반 예문 생성' },
]

export function findStudyMenu(pathname: string): StudyMenu | undefined {
  return STUDY_MENUS.find((m) => pathname.startsWith(m.path))
}
