const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();
const url = "https://howlongtobeat.com/";

router.post("/", async (req, res) => {
  try {
    const { _id, name, howLongToBeatId } = req.body;
    const payload = {
      searchType: "games",
      searchTerms: [name],
      searchPage: 1,
      size: 20,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: {
            min: 0,
            max: 0,
          },
          gameplay: {
            perspective: "",
            flow: "",
            genre: "",
          },
          modifier: "",
        },
        users: {
          sortCategory: "postcount",
        },
        filter: "",
        sort: 0,
        randomizer: 0,
      },
    };

    let game = {
      _id,
      howLongToBeatId,
    };

    if (!game.howLongToBeatId) {
      let result = await axios.post(`${url}api/search`, payload, {
        headers: {
          "Content-Type": "application/json",
          "Origin": "https://howlongtobeat.com",
          "Referer": "https://howlongtobeat.com",
        },
      });

      const { game_id } = result.data.data[0];
      game.howLongToBeatId = game_id;
    }

    result = await axios.get(`${url}game/${game.howLongToBeatId}`);

    const $ = cheerio.load(result.data);
    let node = $("main");
    // console.log(node.attr("class"));
    node = node.find("div[class^='GameStats_game_times']");
    // console.log(node.attr("class"));
    node = node.children("ul").contents();

    // const data = $.extract({
    //   li: ["main div[class^='GameStats_game_times'] ul .GameStats_short__mnFjd"],
    // });

    const pattern = /[^\d]+/g;
    const main = node.eq(0).contents().eq(1).text().replace(pattern, "");
    const mainPlus = node.eq(1).contents().eq(1).text().replace(pattern, "");
    const complete = node.eq(2).contents().eq(1).text().replace(pattern, "");

    game.howLongToBeatTime = { main, mainPlus, complete };
    game.howLongToBeatTimeUpdated = Date.now();

    // console.log(game);

    axios.put(`http://localhost:5000/api/games/${_id}`, game);

    res.status(201).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
