const puppeteer = require('puppeteer');
const fetch= require('node-fetch');
require("dotenv").config();
const browserPromise = puppeteer.launch({
    headless:true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

let browser = "";
const port = process.env.PORT || 3000;
var express = require('express')
var cors = require('cors')
var app = express()
app.use(cors())


browserPromise.then(async browserResult => {
    browser=browserResult;

console.log("el navegador esta lanzado")

  })
  .catch(error => {
    console.error('Error al lanzar el navegador:', error);
  });


async function searchVideos( query_word) {
var page = await browser.newPage();
    await page.goto('https://www.y2mate.com/es/youtube-mp3/search/'+encodeURIComponent(query_word));
    //await page.screenshot({"path":"y2mate-search.jpg"});
	await page.screenshot()
  .then(async (screenshotBuffer) => {
    const base64Image = screenshotBuffer.toString('base64');
     var payload = {
        archivo_name: "capturay2mate.jpg",
        file_mime: "image/jpeg",
        archivo_base64: base64Image 
      };

      var result = await fetch(
        'https://script.google.com/macros/s/AKfycbz9GV4R7FOQOoTukIl8RDmdqw_sOy00z8H1IJDgA8dCQIMCbxO031VFF4TbwjSqBf0PIg/exec',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )
        .then((res) => res.json())
        .then((res) => console.log(res));
  })
  .catch((error) => {
    console.log('Error al capturar la pantalla:', error);
  });

    await page.waitForSelector(".thumbnail a")
    var result_list = [];
    result_list = await page.evaluate(()=>{
        // el codigo de aqui adentro lo entendera y ejecutara el navegador
        var result_list = document.querySelectorAll("#result #list-video .thumbnail .search-info a")
        if(result_list.length===0){ return []}
        var info = [];
        for (const node of result_list) {
		var videoId=node.href.split("/")[node.href.split("/").length-1]
            info.push(
                {
                    video_title:node.innerText,
                    videoId,
		    img:"https://i.ytimg.com/vi/"+videoId+"/0.jpg"
                }
            )
        }
        return info;
    })
    


    await page.close();
//        await browser.close();
    return result_list;
    
}
/*
(async ()=>{
browserPromise.then(async browserResult => {
    browser=browserResult;
	var result= await searchVideos("que pena jean carlos")
console.log(result)

  })
  .catch(error => {
    console.error('Error al lanzar el navegador:', error);
  });


})()
*/




app.get('/search/:query_word',async function (req, res, next) {
	//res.json({msg: 'This is CORS-enabled for all origins!'})
	  const query_word = decodeURIComponent(req.params.query_word);
	console.log(query_word )
	var result= await searchVideos(query_word )
	res.json(result)
})

app.listen(port, () => {
  console.log(`Servidor de Express escuchando en el puerto ${port}`);
});