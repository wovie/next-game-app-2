const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const verify = require('../verify');
const games = require('./games');

const router = express.Router();
const url = 'https://howlongtobeat.com/';

async function getData(game) {
  try {
    const { name } = game;
    let { howLongToBeatId } = game;
    if (!howLongToBeatId) {
      const payload = {
        searchType: 'games',
        searchTerms: [name],
        searchPage: 1,
        size: 20,
        searchOptions: {
          games: {
            userId: 0,
            platform: '',
            sortCategory: 'popular',
            rangeCategory: 'main',
            rangeTime: {
              min: 0,
              max: 0,
            },
            gameplay: {
              perspective: '',
              flow: '',
              genre: '',
            },
            modifier: '',
          },
          users: {
            sortCategory: 'postcount',
          },
          filter: '',
          sort: 0,
          randomizer: 0,
        },
      };

      const result = await axios.post(`${url}api/search`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://howlongtobeat.com',
          Referer: 'https://howlongtobeat.com',
        },
      });

      const { game_id } = result.data.data.length > 0 && result.data.data[0];
      if (!game_id) {
        throw new Error(`Unable to determine HowLongToBeat ID for: ${name}`);
      }

      howLongToBeatId = game_id;
    }

    const result = await axios.get(`${url}game/${howLongToBeatId}`);
    const $ = cheerio.load(result.data);
    let node = $('main');
    // console.log(node.attr("class"));
    // node = node.find("div[class^='GameStats_game_times']");
    node = node.find("table[class^='GameTimeTable_game_main_table']");
    // console.log(node.attr("class"));
    node = node.children('tbody').contents();
    // const data = $.extract({
    //   li: ["main div[class^='GameStats_game_times'] ul .GameStats_short__mnFjd"],
    // });

    const howLongToBeatTime = {};
    const pattern = /[^\d]+/g;

    const main = parseInt(
      node.has("td:contains('Main Story')")
        .contents().eq(2).text()
        .split(' ')[0].replace(pattern, ''),
    );
    if (main) howLongToBeatTime.main = main;

    const mainPlus = parseInt(
      node.has("td:contains('Main + Extras')")
        .contents().eq(2).text()
        .split(' ')[0].replace(pattern, ''),
    );
    if (mainPlus) howLongToBeatTime.mainPlus = mainPlus;

    const complete = parseInt(
      node.has("td:contains('Completionist')")
        .contents().eq(2).text()
        .split(' ')[0].replace(pattern, ''),
    );
    if (complete) howLongToBeatTime.complete = complete;

    const update = {
      ...game,
      howLongToBeatId,
      howLongToBeatTime,
      howLongToBeatTimeUpdated: Date.now(),
    };

    const updated = await games.methods.updateGame(update);

    if (!updated.acknowledged) throw updated;
    else return update;
  } catch (e) {
    throw new Error(e.message || e.response.data.message);
  }
}

router.post('/data', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const game = { ...req.body };
    const result = await getData(game);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = {
  router,
  methods: {
    getData,
  },
};
