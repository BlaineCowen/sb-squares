import axios from "axios";
import sharp from "sharp";

export default async function handler(req, res) {
  const { imageUrl } = req.query;

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");
    const { dominant } = await sharp(buffer)
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const hex = `#${dominant.r.toString(16).padStart(2, "0")}${dominant.g
      .toString(16)
      .padStart(2, "0")}${dominant.b.toString(16).padStart(2, "0")}`;

    res.json({ color: hex });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
}
