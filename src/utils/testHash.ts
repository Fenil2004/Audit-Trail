
import { generateHash } from "../utils/genrateHash";

async function testHash() {
  const data = "Shipment Created";

  const hash = await generateHash(data);

  console.log("Original Data:", data);
  console.log("SHA-256 Hash:", hash);
  console.log("Hash Length:", hash.length);
}

