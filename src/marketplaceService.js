export class MarketplaceService {
  list(items = []) {
    return items.filter((item) => item.status === "published");
  }

  publish(work) {
    return {
      ...work,
      marketplaceId: crypto.randomUUID(),
      status: "published",
      publishedAt: new Date().toISOString(),
    };
  }
}

export const marketplaceService = new MarketplaceService();
