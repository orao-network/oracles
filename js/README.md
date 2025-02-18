# Price Service

[Orao Network](https://orao.network/) provides real-time pricing data in a variety of asset classes, including
cryptocurrency, equities, FX and commodities.
These prices are available either via HTTP.

## Installation

### npm

```
$ npm install --save @orao-network/price-service
```

### Yarn

```
$ yarn add @orao-network/price-service
```

## Quickstart

Typical usage of the connection is along the following lines:

```typescript
const priceService = new PriceService("https://prices.orao.network");

// Get the available networks.
const networks = await priceService.getNetworks();

// Get the whitelist
const whitelist = await priceService.getWhitelist(networks[0]);

// Get the latest values of the price feeds as json objects.
const priceFeed = await priceService.getLatestPriceFeeds(network, whitelist[0]);
```

### On-chain Applications

On-chain applications will need to submit the price updates returned by price service to the ORAO oracle contract on
their blockchain.
This option will add a `message` field to `PriceFeed` that represents a signed price update.
The `message` is a binary blob serialized as a base64 string.
Depending on the blockchain, you may need to reformat this into hex or another format before submitting it to the oracle
contract.

### Examples

The [PriceService](./src/examples/PriceServiceDemo.ts) example demonstrates the HTTP APIs
described above.
You can run it with `npm run example`.
A full command that prints BTC and ETH price feeds, in the testnet network, looks like so:

```bash
npm run example -- \
  --endpoint https://prices.orao.network
```
