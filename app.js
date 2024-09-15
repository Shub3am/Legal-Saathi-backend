import express from "express";
import 'dotenv/config'
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs"
import cors from "cors";
const app = express();
app.use(cors())
app.use(express.json())
app.post("/query", async (req,res)=> {

    function fileToGenerativePart(path, mimeType) {
        return {
          inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
          },
        };
      }
    let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const {query} = req.body;
    const allFiles = []

    const files = fs.readdirSync("./data")
    files.forEach(async file => {
        let fa = (fileToGenerativePart(`./data/${file}`, "application/pdf"))
        allFiles.push(fa)
      });
    // const BNS = fileToGenerativePart("./BNS.txt", "text/plain");

  const answer = await model.generateContent([`We have provided multiple pdf documents which has information about the new Bhartiya Nyaya Sanhita and THE BHARATIYA SAKSHYA BILL. The document is in English. You have to provide law consultation with the new documents and your knowledge and also compare the difference between old and new law system. \n\n Query: ${query}`, ...allFiles ]);

    if (!query) {
        res.json({error: "No query provided"})
    }
    res.json({answer: answer.response.text()})
})

app.listen(process.env.PORT || 4000, async () => {
    console.log(`Server Started`)
  })