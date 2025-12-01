import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

console.log("KEY:", process.env.PINATA_API_KEY);
const app = express();

app.use(cors());
app.use(express.json());

app.post("/uploadMetadata", async (req, res) => {
  try {
    const pinataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      req.body,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    res.json({ cid: pinataRes.data.IpfsHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Pinata upload failed" });
  }
});

app.listen(5001, () => console.log("Backend running at http://localhost:5001"));
