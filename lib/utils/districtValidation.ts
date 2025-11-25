/**
 * Extracts district name from an address string
 * Handles Thai format: "Subdistrict, District, City, Postal, Country"
 */
export function extractDistrict(address: string): string {
  if (!address) return "";
  // Match pattern like "Thung Khru District" or "Thung Khru"
  const districtMatch = address.match(/([^\,]+?\s+District|\d{5})/);
  if (districtMatch?.[1]) {
    return districtMatch[1].replace(/\s+District$/, "").trim();
  }
  // Fallback: split by comma and get the second part
  const parts = address.split(",").map((p) => p.trim());
  return parts[1] || "";
}

/**
 * Validates if both selectedLocation and displayName are in the same district
 */
export function validateDistrict(
  selectedLocation: string,
  displayName: string
): boolean {
  const district1 = extractDistrict(selectedLocation);
  const district2 = extractDistrict(displayName);
  return (
    district1.toLowerCase() === district2.toLowerCase() && district1 !== ""
  );
}
