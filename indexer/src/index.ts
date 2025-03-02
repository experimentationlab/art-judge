import { ponder } from "ponder:registry";
import schema from "ponder:schema";
import { hexToString, keccak256, decodeAbiParameters } from "viem";

// Helper function to make BigInt serializable
function replaceBigInt(key: string, value: any) {
  return typeof value === 'bigint' ? value.toString() : value;
}

ponder.on("ScribbleTaskManager:NoticeReceived", async ({ event, context }) => {
  try {
    // Decode the notice data
    const decodedData = decodeAbiParameters(
      [
        { name: "result", type: "uint256" },
        { name: "theme", type: "string" },
        { name: "classes", type: "string[]" },
        { name: "probabilities", type: "uint256[]" }
      ],
      event.args.notice
    );

    const [result, theme, classes, probabilities] = decodedData;
    
    // Create predictions array (top 3)
    const predictions = [];
    for (let i = 0; i < Math.min(3, classes.length); i++) {
      if (classes[i] !== undefined && probabilities[i] !== undefined) {
        predictions.push({
          class: classes[i],
          probability: probabilities[i]
        });
      }
    }

    // Use the replaceBigInt helper function when stringifying
    const predictionsJson = JSON.stringify(predictions, replaceBigInt);

    // Store both raw and decoded data
    await context.db.insert(schema.noticeEvent).values({
      id: event.log.id,
      payloadHash: event.args.payloadHash,
      user: event.args.user,
      notice: event.args.notice,
      confidence: result,
      theme: theme,
      predictions: predictionsJson
    });
  } catch (error) {
    console.error("Error processing NoticeReceived event:", error);
    
    // Store just the raw data if decoding fails
    await context.db.insert(schema.noticeEvent).values({
      id: event.log.id,
      payloadHash: event.args.payloadHash,
      user: event.args.user,
      notice: event.args.notice
    });
  }
});

ponder.on("TaskIssuer:TaskIssued", async ({ event, context }) => {
  try {
    // Check if machineHash matches our expected value
    const expectedMachineHash = process.env.MACHINE_HASH || "0x5806BDD445D06865E481BD4301C7616DBB89596B057CB39F847DCA42429243DB";
    
    if (event.args.machineHash.toLowerCase() !== expectedMachineHash.toLowerCase()) {
      console.log(`Skipping event with different machineHash: ${event.args.machineHash}`);
      return; 
    }
    
    // Compute payload hash from input
    const payloadHash = keccak256(event.args.input);
    
    // Parse the JSON data from the input
    const jsonString = hexToString(event.args.input);
    const jsonData = JSON.parse(jsonString);
    
    // Extract image data and theme
    const imageData = jsonData.image || "";
    const theme = jsonData.theme || "";
    
    await context.db.insert(schema.taskEvent).values({
      id: event.log.id,
      payloadHash,
      userAddress: event.transaction.from,
      imageData,
      theme,
      blockNumber: BigInt(event.block.number),
      transactionHash: event.transaction.hash,
    });
  } catch (error) {
    console.error("Error processing TaskIssued event:", error);
  }
});
