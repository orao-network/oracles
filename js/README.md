# ORAO Price Service SDK

This JavaScript/TypeScript SDK provides a client for interacting with the ORAO Price Service API. It allows users to
fetch price feeds for various assets across different networks.

## Features

- Fetch available networks
- Retrieve whitelists for specific networks
- Get latest price feeds for specified assets on a given network

## Installation

To use this SDK in your project, install it via npm:

```bash
npm install @orao-network/price-service-sdk
```

## Usage

Here's a basic example of how to use the SDK:

```typescript
import {
  PriceService,
  PriceServiceConfig,
} from "@orao-network/price-service-sdk";

// Initialize the PriceService
const config: PriceServiceConfig = {
  authToken: "your_auth_token",
  timeout: 5000,
  httpRetries: 3,
  logger: console,
};

const priceService = new PriceService("https://api.example.com", config);

// Get available networks
priceService
  .getNetworks()
  .then((networks) => console.log("Available networks:", networks))
  .catch((error) => console.error("Error fetching networks:", error));

// Get whitelist for a specific network
priceService
  .getWhitelist("price-secp256k1")
  .then((whitelist) => console.log("price-secp256k1 whitelist:", whitelist))
  .catch((error) => console.error("Error fetching whitelist:", error));

// Get latest price feeds
const assetNames = ["bitcoin", "ethereum"];
priceService
  .getLatestPriceFeeds("price-secp256k1", assetNames)
  .then((priceFeed) => console.log("Latest price feed:", priceFeed))
  .catch((error) => console.error("Error fetching price feeds:", error));
```

## API Reference

### `PriceService`

The main class for interacting with the ORAO Price Service API.

#### Constructor

```typescript
constructor(endpoint
:
string, config ? : PriceServiceConfig
)
```

- `endpoint`: The base URL of the ORAO Price Service API.
- `config`: Optional configuration object.

#### Methods

##### `getNetworks(): Promise<string[]>`

Fetches the list of available networks.

##### `getWhitelist(network: string): Promise<string[]>`

Retrieves the whitelist for a specified network.

##### `getLatestPriceFeeds(network: string, assetNames: string[]): Promise<PriceFeed>`

Retrieves the latest price feeds for specified assets on a given network.

### Types

#### `PriceServiceConfig`

```typescript
{
  authToken ? : string;
  timeout ? : number;
  httpRetries ? : number;
  logger ? : Logger;
}
```

#### `PriceFeed`

```typescript
{
  epoch: number;
  requestHash: string;
  configHash: string;
  prices: Record<string, string>;
  signatures: Record<string, string>;
  message: string;
}
```

## Error Handling

All methods return Promises that may reject with errors. It's recommended to use try-catch blocks or .catch() methods to
handle potential errors.

## Logging

The SDK uses a configurable logger. You can provide your own logger implementation or use the default console logger for
warnings and errors.
