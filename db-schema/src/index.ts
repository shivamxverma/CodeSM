import * as tables from "./db/schema.js"
import * as relations from "./db/relations.js"

export const schema = {
  ...tables,
  ...relations
}