import * as tables from "./db/schema"
import * as relations from "./db/relations"

export const schema = {
  ...tables,
  ...relations
}