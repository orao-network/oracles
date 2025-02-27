import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { Logger } from "ts-log";

export type DurationInMs = number;

export type PriceServiceConfig = {
  /** Authentication token for accessing the price service. **/
  authToken?: string;
  /** Timeout of each request (for all the retries). Default: 5000ms **/
  timeout?: DurationInMs;
  /**
   * Number of times an HTTP request will be retried before the API returns a failure. Default: 3.
   *
   * The connection uses exponential back-off for the delay between retries. However,
   * it will time out regardless of the retries at the configured `timeout` time.
   */
  httpRetries?: number;
  /** Optional logger (e.g: console or any logging library) to log internal events **/
  logger?: Logger;
};

function convertToPriceFeed(jsonData: any): PriceFeed {
  const result = jsonData.Price.result.Ok;

  return {
    epoch: result.request_id.epoch,
    requestHash: result.request_id.request_hash,
    configHash: result.config_hash,
    prices: result.response.prices,
    signatures: result.signatures,
    message: jsonData.Price.message,
  };
}

/**
 * Represents an aggregate price from Orao publisher feeds.
 */
export interface PriceFeed {
  epoch: number;
  requestHash: string;
  configHash: string;
  prices: Record<string, string>;
  signatures: Record<string, string>;
  message: string;
}

export class PriceService {
  private readonly httpClient: AxiosInstance;

  private readonly logger: Logger;

  /**
   * Constructs a new Connection.
   *
   * @param endpoint endpoint URL to the price service. Example: https://website/example/
   * @param config Optional PriceServiceConfig for custom configurations.
   */
  constructor(endpoint: string, config?: PriceServiceConfig) {
    this.httpClient = axios.create({
      baseURL: endpoint,
      timeout: config?.timeout || 5000,
      headers: {
        Authorization: `Bearer ${
          config?.authToken ||
          "f9f16deeaa0876a631b3825b61e29d0e16e02134125fc6c3cf59383f46577aea"
        }`,
      },
    });
    axiosRetry(this.httpClient, {
      retries: config?.httpRetries || 3,
      retryDelay: axiosRetry.exponentialDelay,
    });

    // Default logger is console for only warnings and errors.
    this.logger = config?.logger || {
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    };
  }

  /**
   * Fetches the list of available networks from the price service.
   *
   * This method sends a GET request to the "/api/env/networks/list" endpoint
   * and retrieves an array of network names supported by the price service.
   *
   * @returns A Promise that resolves to an array of strings, where each string
   *          represents the name of an available network.
   * @throws Will throw an error if the HTTP request fails or if the response
   *         cannot be parsed correctly.
   */
  async getNetworks(): Promise<string[]> {
    const response = await this.httpClient.get(`/api/env/networks/list`);
    const networksJson = response.data as { networks: string[] };
    return networksJson.networks;
  }

  /**
   * Fetches the whitelist for a specified network.
   *
   * This method sends a POST request to the "/api/network/whitelist/get" endpoint
   * to retrieve the whitelist associated with the given network.
   *
   * @param network - The name or identifier of the network for which to fetch the whitelist.
   * @returns A Promise that resolves to an array of strings representing the whitelist items for the specified network.
   * @throws Will throw an error if the HTTP request fails or if the response cannot be parsed correctly.
   */
  async getWhitelist(network: string): Promise<string[]> {
    const response = await this.httpClient.post(`/api/network/whitelist/get`, {
      network,
    });
    const whitelistJson = response.data as { whitelist: string[] };
    return whitelistJson.whitelist;
  }

  /**
   * Fetches the latest price feeds for specified assets on a given network.
   *
   * This method sends a GET request to the "/api/network/feed/get" endpoint
   * to retrieve the most recent price information for the specified assets.
   *
   * @param network - The name or identifier of the network for which to fetch price feeds.
   * @param assetNames - An array of asset names or identifiers for which to fetch price feeds.
   * @returns A Promise that resolves to a PriceFeed object containing the latest price information.
   * @throws {Error} If the assetNames array is empty.
   * @throws Will throw an error if the HTTP request fails or if the response cannot be parsed correctly.
   */
  async getLatestPriceFeeds(
    network: string,
    assetNames: string[]
  ): Promise<PriceFeed> {
    if (assetNames.length === 0) {
      throw new Error("asset names array is empty");
    }

    const response = await this.httpClient.get(`/api/network/feed/get`, {
      params: {
        network,
        qualifier: "cmc",
        slugs: assetNames.join(","),
      },
    });
    const priceFeedsJson = response.data;
    return convertToPriceFeed(priceFeedsJson);
  }
}
