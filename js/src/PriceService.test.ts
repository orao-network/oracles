import axios, { AxiosInstance } from "axios";
import { PriceService, PriceFeed } from "./PriceService";

jest.mock("axios");

describe("PriceService", () => {
  let priceService: PriceService;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Create a mock Axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    // Mock axios.create to return our mock instance
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    priceService = new PriceService("https://api.example.com");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getNetworks", () => {
    it("should fetch and return networks", async () => {
      const mockNetworks = ["network1", "network2"];
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { networks: mockNetworks },
      });

      const result = await priceService.getNetworks();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/api/env/networks/list"
      );
      expect(result).toEqual(mockNetworks);
    });
  });

  describe("getWhitelist", () => {
    it("should fetch and return whitelist for a given network", async () => {
      const mockWhitelist = ["asset1", "asset2"];
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { whitelist: mockWhitelist },
      });

      const result = await priceService.getWhitelist("testNetwork");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/api/network/whitelist/get",
        { network: "testNetwork" }
      );
      expect(result).toEqual(mockWhitelist);
    });
  });

  describe("getLatestPriceFeeds", () => {
    it("should throw an error if assetNames array is empty", async () => {
      await expect(
        priceService.getLatestPriceFeeds("testNetwork", [])
      ).rejects.toThrow("asset names array is empty");

      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should fetch and return price feeds for given assets", async () => {
      const mockPriceFeed: PriceFeed = {
        epoch: 123,
        requestHash: "hash123",
        configHash: "config123",
        prices: { asset1: "100", asset2: "200" },
        signatures: { sig1: "signature1", sig2: "signature2" },
        message: "Test message",
      };

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          Price: {
            result: {
              Ok: {
                request_id: {
                  epoch: mockPriceFeed.epoch,
                  request_hash: mockPriceFeed.requestHash,
                },
                config_hash: mockPriceFeed.configHash,
                response: { prices: mockPriceFeed.prices },
                signatures: mockPriceFeed.signatures,
              },
            },
            message: mockPriceFeed.message,
          },
        },
      });

      const result = await priceService.getLatestPriceFeeds("testNetwork", [
        "asset1",
        "asset2",
      ]);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/api/network/feed/get",
        {
          params: {
            network: "testNetwork",
            qualifier: "cmc",
            slugs: "asset1,asset2",
          },
        }
      );
      expect(result).toEqual(mockPriceFeed);
    });
  });
});
