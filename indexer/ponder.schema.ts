import { onchainTable } from "ponder";

export const noticeEvent = onchainTable("noticeEvent", (t) => ({
  id: t.text().primaryKey(),
  payloadHash: t.hex().notNull(),
  user: t.hex().notNull(),
  notice: t.text().notNull(),
  confidence: t.bigint(),
  theme: t.text(),
  predictions: t.text()
}));

export const taskEvent = onchainTable("taskEvent", (t) => ({
  id: t.text().primaryKey(),
  payloadHash: t.hex().notNull(),
  userAddress: t.hex().notNull(),
  imageData: t.text().notNull(),
  theme: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));
