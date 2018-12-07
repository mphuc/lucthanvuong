'use strict'

const express = require('express');
const MarketCtrl = require('../controllers/exchange/market');
const AutosCtrl = require('../controllers/exchange/auto');
const ChartCtrl = require('../controllers/exchange/chart');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/market/:MarketName', MarketCtrl.Indexs);
router.post('/submit-buy',auth, MarketCtrl.SubmitBuy);
router.post('/submit-sell',auth, MarketCtrl.SubmitSell);
router.post('/cancel-order-open',auth, MarketCtrl.CancelOrder);
router.post('/reload-balance',auth, MarketCtrl.ReloadBalance);
router.get('/loadorder-exchange-buy', MarketCtrl.LoadOrder_buyAll);
router.get('/loadorder-exchange-sell', MarketCtrl.LoadOrder_sellAll);
router.get('/load-order-open',auth, MarketCtrl.LoadOrder_Open_id);
router.get('/load-exchange-makethistory', MarketCtrl.LoadMarketHistory);
router.get('/load-exchange-mymakethistory',auth, MarketCtrl.LoadMyMarketHistory);
router.get('/load-volume', MarketCtrl.LoadVolume);
router.get('/load-chart/:MarketName', ChartCtrl.LoadTempalate);
router.get('/load-json-chart/:MarketName', ChartCtrl.get_json_chart);
router.get('/load-json-chart-book/:MarketName', ChartCtrl.get_json_chart_book);
router.get('/load-chart-book/:MarketName', ChartCtrl.LoadTempalateBook);

module.exports = router;