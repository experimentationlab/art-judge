import { onchainTable } from "ponder";

export const noticeEvent = onchainTable("noticeEvent", (t) => ({
  id: t.text().primaryKey(),
  payloadHash: t.hex().notNull(),
  user: t.hex().notNull(),
  notice: t.text().notNull(),
}));
