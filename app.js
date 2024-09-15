import express from "express";
import 'dotenv/config'
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs"
import cors from "cors";
import * as cheerio from 'cheerio';


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
    // https://serpapi.com/search?q=&api_key=9c733ccee59d2fea9ac0020680d99be1c1c1c6d71c509ef0b38edf66b349964b





    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const {query} = await req.body;
    if (!query) {
      return res.json({error: "No query provided"})
  }


  let data = ''
  let internetData = await fetch(`https://serpapi.com/search?q=allintext:${query} india article &api_key=${process.env.SERP_API}`).then(res=>res.json())
  // console.log(internetData)
  internetData.organic_results.forEach(async element => {
    try {
    let check = await cheerio.fromURL(element.link)
  
      let allP = check('p')
    allP.each((i, element) => {
      // console.log(i)
      console.log(check(element).text());
      data += data + check(element).text()
  });
      }catch(e)  {}
  })


    const allFiles = []

    const files = fs.readdirSync("./data")
    files.forEach(async file => {
        let fa = (fileToGenerativePart(`./data/${file}`, "application/pdf"))
        allFiles.push(fa)
      });
    // const BNS = fileToGenerativePart("./BNS.txt", "text/plain");

  const answer = await model.generateContent([`You are a Indian law expert, We have provided multiple pdf documents which has information about the new Bhartiya Nyaya Sanhita and THE BHARATIYA SAKSHYA BILL. The document is in English. You have to provide law consultation with the new documents and your knowledge and also compare the difference between old and new law system. Do not mention that document was provided and be confident about indian law system and the document data,
    
  Here is More Data about the topic ${data} \n\n Query: ${query}`, ...allFiles ]);
  return res.json({answer: answer.response.text()})

})

// app.get("/test", async (req,res)=> {
// //   const check = (await cheerio.fromURL("https://en.wikipedia.org/wiki/Bharatiya_Nyaya_Sanhita"))
// let data = ''
// let internetData = await fetch(`https://serpapi.com/search?q=What is BNS law india article &api_key=`).then(res=>res.json())
// // console.log(internetData)
// internetData.organic_results.forEach(async element => {
//   try {
//   let check = await cheerio.fromURL(element.link)

//     let allP = check('p')
//   allP.each((i, element) => {
//     // console.log(i)
//     console.log(check(element).text());
//     data += data + check(element).text()
// });
//     }catch(e)  {}
// })
//   console.log("\n\n\n", data)
//     res.json({test: "test"})
// })  

app.listen(process.env.PORT || 4000, async () => {
    console.log(`Server Started`)
  })