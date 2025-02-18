import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { PriceService } from "../index";

const argv = yargs(hideBin(process.argv))
  .option("endpoint", {
    description:
      "Endpoint URL for the price service. e.g: https://endpoint/example",
    type: "string",
    required: true,
  })
  .help()
  .alias("help", "h")
  .parserConfiguration({
    "parse-numbers": false,
  })
  .parseSync();

async function run() {
  const connection = new PriceService(argv.endpoint, {
    logger: console, // Providing logger will allow the connection to log its events.
  });

  const networks = await connection.getNetworks();
  console.log(networks);

  for (const network of networks) {
    const whitelist = await connection.getWhitelist(network);
    console.log(`${network}:`, whitelist);

    const priceFeed = await connection.getLatestPriceFeeds(network, whitelist);
    if (priceFeed) {
      console.log(`${network} price feed:`, priceFeed);
    } else {
      console.log(`${network} price feed: Not found`);
    }
  }
}

void run();
