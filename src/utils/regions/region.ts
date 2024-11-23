// types for region data structure
interface Region {
  id: number;
  name: string;
  subregions: Region[];
}

export class RegionService {
  private regions: Region | null = null;
  private regionIdToSubregionIds: Map<number, Set<number>> = new Map();
  private regionIdToRegion: Map<number, Region> = new Map();

  /**
   * loads and processes the region data for efficient lookups
   * @param jsonData The region JSON data
   */
  public loadRegions(jsonData: string): void {
    try {
      this.regions = JSON.parse(jsonData);
      this.processRegions();
    } catch (error) {
      throw new Error(`Failed to parse region data: ${error}`);
    }
  }

  /**
   * process regions to build lookup maps
   */
  private processRegions(): void {
    if (!this.regions) {
      throw new Error("Regions data not loaded");
    }

    // Clear existing maps
    this.regionIdToSubregionIds.clear();
    this.regionIdToRegion.clear();

    // Process the region tree
    this.traverseRegions(this.regions);
  }

  /**
   * recursively traverse the region tree to build lookup maps
   */
  private traverseRegions(region: Region, parentIds: number[] = []): void {
    // store the region in the lookup map
    this.regionIdToRegion.set(region.id, region);

    // create a set for this region's subregion IDs
    const subregionIds = new Set<number>();
    this.regionIdToSubregionIds.set(region.id, subregionIds);

    // add this region's ID to all parent regions' subregion sets
    for (const parentId of parentIds) {
      this.regionIdToSubregionIds.get(parentId)?.add(region.id);
    }

    // recursively process subregions
    for (const subregion of region.subregions) {
      // add immediate subregion to the current region's set
      subregionIds.add(subregion.id);
      // continue traversal with current region ID added to parent IDs
      this.traverseRegions(subregion, [...parentIds, region.id]);
    }
  }

  /**
   * get all subregion IDs for a given region ID (including nested subregions)
   * @param regionId The region ID to look up
   * @returns list of all subregion IDs
   */
  public getSubregionIds(regionId: number): number[] {
    const subregions = this.regionIdToSubregionIds.get(regionId);
    if (!subregions) {
      throw new Error(`Region ID ${regionId} not found`);
    }
    return Array.from(subregions);
  }

  /**
   * get all subregions for a given region ID (including nested subregions)
   * @param regionId The region ID to look up
   * @returns Array of all subregion objects
   */
  public getSubregions(regionId: number): Region[] {
    const subregionIds = this.getSubregionIds(regionId);
    const subregions: Region[] = [];

    for (const id of subregionIds) {
      const region = this.regionIdToRegion.get(id);
      if (region) {
        subregions.push(region);
      }
    }

    return subregions;
  }
}

/** example usage:
const regionService = new RegionService();

// Load regions from file
const jsonData = await Bun.file("src/utils/regions/regions.json").text();
regionService.loadRegions(jsonData);

// Get all subregions for Germany (ID: 1)
const germanSubregions = regionService.getSubregions(1);
console.log("german subregions: ", germanSubregions);

// Get just the subregion IDs for Germany
const germanSubregionIds = regionService.getSubregionIds(1);
console.log("german subregions ids", germanSubregionIds);

*/
