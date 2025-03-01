import { ponder } from "ponder:registry";
import schema from "ponder:schema";

ponder.on("ScribbleTaskManager:NoticeReceived", async ({ event, context }) => {
  await context.db.insert(schema.noticeEvent).values({
    id: event.log.id,
    payloadHash: event.args.payloadHash,
    user: event.args.user,
    notice: event.args.notice,
  });
});
