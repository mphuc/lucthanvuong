'use strict'

const express = require('express');
const UserController = require('../controllers/user');

const crlUserLogin = require('../controllers/user/login');
const crlUserActive = require('../controllers/user/active');
const crlUserRegister = require('../controllers/user/register');

const HomeController = require('../controllers/home');
const InvestController = require('../controllers/invest');
const DashboardController = require('../controllers/dashboard');
const SettingController = require('../controllers/setting');
const AffiliateController = require('../controllers/affiliate');
const ExchangeController = require('../controllers/exchange');
const FaqController = require('../controllers/faq');
const HistoryController = require('../controllers/history');
const WithdrawController = require('../controllers/withdraw');
const WalletController = require('../controllers/wallet');
const auth = require('../middlewares/auth');
const capchaControlelr = require('../controllers/capcha');
const IcoCtrl = require('../controllers/ico');
const BalanceController = require('../controllers/balance');

const Auto_crontab = require('../controllers/auto');
const router = express.Router();


/*balance*/
router.get('/account/balance', auth, BalanceController.Balance);
router.post('/account/balance/withdraw', auth, BalanceController.SubmitWithdraw);

router.post('/account/balance/get-wallet', auth, BalanceController.GetWallet);
router.post('/account/balance/get-wallets', auth, BalanceController.GetWalletS);

router.get('/account/balance/history-withdraw-pending', auth, BalanceController.getWithdraw_user_pendding);
router.get('/account/balance/history-deposit-pending', auth, BalanceController.getDeposit_user_pendding);

router.get('/account/balance/history-withdraw-finish', auth, BalanceController.getWithdraw_user_finish);
router.get('/account/balance/history-deposit-finish', auth, BalanceController.getDeposit_user_finish);
router.post('/account/balance/remove-withdraw', auth, BalanceController.Remove_Withdraw);
router.get('/token_crt', auth, BalanceController.create_token);
/*end balance*/

/*RUTAS*/
router.get('/account/dashboard', auth, DashboardController.IndexOn);
router.get('/account/exchange', auth, DashboardController.ExchangeTemplate);

// transfer to coin wallet
router.post('/account/transfer', auth, DashboardController.TransferToCoin);

router.get('/account/invest', auth, InvestController.IndexOn);
router.get('/account/lending', auth, InvestController.DepositS);
router.post('/account/invest', auth, InvestController.InvestSubmit);
router.post('/account/deposits', auth, InvestController.LoadDeposit);
router.get('/test', auth, InvestController.test);
// Withdraw
router.post('/account/withdraw', auth, WithdrawController.WithdrawSubmit);
router.get('/de495b769293abf4edf3e08a021a', WithdrawController.active);
router.get('/de495b769293abf4edf3e08a021abtc', WithdrawController.actives);
// wallet
router.post('/account/wallet', auth, WalletController.Index);
//router.get('/wallet/walletnotify/:txid', WalletController.Notify);

// Setting
router.get('/account/setting/', auth, SettingController.Index);
//router.get('/account/setting/login-history', auth, SettingController.IndexLoginHistory);
router.post('/account/setting/personal', auth, SettingController.updatePersonal);
router.post('/account/setting/authy', auth, SettingController.authy);
router.post('/account/setting/password', auth, SettingController.changePasswrd);
// affiliate
//router.get('/account/affiliate/main', auth, AffiliateController.Indexmain);
router.get('/account/system-network', auth, AffiliateController.Treerefferal);
router.get('/account/refferal', auth, AffiliateController.Indexrefferal);
router.get('/account/affiliate/promo-materials', auth, AffiliateController.Indexpromo);
router.post('/account/refferal', auth, AffiliateController.getRefferal);
// history
router.post('/account/transaction', auth, HistoryController.Index);
router.get('/account/history-transaction',auth, HistoryController.IndexOn_template);

// Exchange
router.get('/exchange', auth, ExchangeController.Index);


router.post('/account/loadWithdraw', auth, WithdrawController.LoadDataWithdraw);
router.post('/account/loadDeposit', auth, WithdrawController.LoadDataDeposit);


router.get('/two-factor-auth', UserController.getAuthy);
router.get('/account/logout', UserController.logOut);

router.get('/register', crlUserRegister.getTemplateRegister);
router.post('/signUp', crlUserRegister.signUp);

router.post('/Authy', UserController.checkAuthy);

router.post('/signIn', crlUserLogin.signIn);

router.get('/verify-account', crlUserActive.active);


router.get('/login', crlUserLogin.getTemplateLogin);
router.get('/forgot-password', crlUserLogin.getTemplateforgot);
router.post('/ForgotPassword', crlUserLogin.ForgotPassword);

// FAQS
router.get('/faq',FaqController.Index);

/*RUTA CON MIDDLEWARE se llama solo auth porque solo tiene una funcion en el archivo*/
router.get('/test', auth , (req,res)=>{ 
	res.status(200).send({message: req.session});
});

router.get('/api/auth', auth);
// Login

// Template Home
router.get('/', HomeController.getTemplateHome);
//router.get('/ico', HomeController.Ico);
//router.get('/InfoSTC', HomeController.InfoSTC);
router.get('/blog-detail', HomeController.getTemplateBlogDetail);

// Ico 

router.post('/ico/get-price-ico',auth, IcoCtrl.GetPriceICO);
router.get('/account/ico',auth, IcoCtrl.GettemplateICO);
router.get('/account/ico-details',auth, IcoCtrl.GettemplateDetailsICO);
router.post('/ico/submit-buy',auth, IcoCtrl.IcoSubmit);


router.get('/walletnotifybtc/:txid', IcoCtrl.Notifybtc);
router.get('/walletnotifylen/:txid', IcoCtrl.Notifygmd);

/*router.post('/ico', IcoCtrl.IcoSubmit);
router.post('/ico/balance', IcoCtrl.Balance);
router.get('/walletnotify/:txid', IcoCtrl.Notify);
router.get('/ico/detail', IcoCtrl.LoadHistory);
router.get('/walletnotifygmd/:txid', IcoCtrl.Notifygmd);*/
//capcha Image
router.get('/capcha.png', capchaControlelr.capchaImage);


const TickerCtrl = require('../controllers/ticker');
router.get('/ticker', TickerCtrl.LoadPrice);

//Setup
const SetupCtrl = require('../controllers/setup');
router.get('/setup', SetupCtrl.Setup);


router.get('/demo', (req,res)=>{
var moments = require('moment-timezone');

const moment = require('moment');
	var date1 = "2017-10-15 23:59:59"
	// date1 = moments(date1).tz("Asia/Hong_Kong").format();
	date1 = moment(date1).format('MM/DD/YYYY LT');
	var date2 = Date.now();
	console.log(moment(date2).format('MM/DD/YYYY LT'));
	// date2 = moments(date2).tz("Asia/Hong_Kong").format();
	date2 = moment(date2).format('MM/DD/YYYY LT');
	console.log(date1);
	console.log(date2);
   

	if (date1 > date2) {
	  res.status(200).send({'a': 1, 'date1': date1, 'date2': date2});
	} else {
	  res.status(200).send({'a': 2, 'date2': date2, 'date1': date1});
	}

	
});


module.exports = router;