import { reduceRight } from 'ramda'

// TODO: generate from TL scheme
export interface Entity {
  _: string,
  offset: number,
  length: number
}

export type RichText = {
  _: string,
  text: string,
  url?: string,
  user_id?: number,
}

type ParseReducer = (
  entity: Entity,
  accum: RichText[],
) => RichText[]

const parseReducer: ParseReducer = ({ offset, length, _, ...rest }, acc) => {
  const first = acc[0]
  acc.shift()
  return [
    richRawText(first.text.slice(0, offset)),
    richText(_, first.text.slice(offset, offset + length), rest),
    richRawText(first.text.slice(offset + length)),
    ...acc,
  ]
}

export const parse = (entities: Entity[], text: string) =>
  reduceRight(
    parseReducer,
    [richRawText(text)],
    entities,
  )

const richText = (_: string, text: string, rest: {}): RichText =>
  ({ _, text, ...rest })

const richRawText = (text: string): RichText =>
  ({ _: 'messageEntityText', text })

