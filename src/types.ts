export type Role = 'member' | 'leader'

export interface Adjustments {
  brightness: number
  contrast: number
  saturate: number
  hueRotate: number
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
}

/** A region of a source image, in that image's natural pixels. */
export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CardData {
  role: Role
  familyName: string
  parentsNames: string
  childrensNames: string
  leaderName: string
  leaderRole: string
  leaderTitle: string
}

export const EMPTY_CARD: CardData = {
  role: 'member',
  familyName: '',
  parentsNames: '',
  childrensNames: '',
  leaderName: '',
  leaderRole: '',
  leaderTitle: '',
}
