const pw = require("playwright");
const fs = require("fs");
const fetch = require('node-fetch');

let pageUrlList = [];
const totalpage = 52;
const pageUrlPattern = /meipin.im\/p\/[0-9]+/gm;
(async () => {
  const browser = await pw.chromium.launch({ headless: false }); // or 'chromium', 'firefox'
  const context = await browser.newContext();
  const page = await context.newPage();
  //爬出所有页面链接
  for (let i = 1; i < totalpage + 1; i++) {
    await page.goto("https://meipin.im/page/" + i);
    const tmpurls = await page.$$eval("a", (nodes) => nodes.map((n) => n.href));
    pageUrlList = pageUrlList.concat(
      tmpurls.filter((tmpurl) => tmpurl.search(pageUrlPattern) > 0)
    );
  }
  pageUrlList = Array.from(new Set(pageUrlList));
  //生成文件夹
  for (url in pageUrlList) {
    fs.mkdirSync("./res/" + pageUrlList[url].split("/").slice(-1));
  }
  
  for (pageindex in pageUrlList) {
    await page.goto(pageUrlList[pageindex]);
    console.log("goto:"+pageUrlList[pageindex]);
    const imgurls = await page.$$eval("img", (nodes) =>nodes.map((n) => n.src));
    //爬页面下图片
    for (imgindex in imgurls) {
      console.log();
      const response = await fetch(imgurls[imgindex]);
      const buffer = await response.buffer();
      fs.writeFileSync("./res/" +pageUrlList[pageindex].split("/").slice(-1)+"/"+ imgurls[imgindex].split("/").slice(-1), buffer)
      console.log(imgurls[imgindex]+" finished downloading!");
    }
  }
  await browser.close();
})();
