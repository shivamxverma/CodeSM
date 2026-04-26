import * as tables from "../db/src/schema.ts"
import * as relations from "../db/src/relations.ts"

export const schema = {
  ...tables,
  ...relations
}