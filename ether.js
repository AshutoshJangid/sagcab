var express = require("express");
var app = express();
var bodyParser = require('body-parser');
const Web3 = require("web3");
const request = require("request");
//var HDWalletProvider = require("truffle-hdwallet-provider");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const contractHash='0xc9c34cc6f60fbdda66282f8bdf87842f458ddfba';
let { convertETH } = require('cryptocurrency-unit-convert');
let { convert } = require('./helpers/index')
let { dec2hex } = convert;
var bip39 = require('bip39');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const infuraAddress = "https://ropsten.infura.io/v3/6fdcf23f3ddc47a18fab11eadfc943a2";
//const infuraAddress = "https://mainnet.infura.io/v3/a938f0bfc23342ac900614426f3a4253";
//var item = items[Math.floor(Math.random() * items.length)];
app.use(function (req, res, next) {
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();

});

const getContract = (from, web3) => {
//  var web3 = provider(mnemonic);
    return new web3.eth.Contract(
        require('./config/tokenAbi.json'),
        contractHash,
        { gas:"300000", from }
    );
};


app.post("/registerUser",async function(req,res){
  //console.log(req.body);
  const mnemonic = bip39.generateMnemonic();
   //var provider = new HDWalletProvider(mnemonic, infuraAddress);
   let provider = new HDWalletProvider({
			mnemonic: {
			  phrase: mnemonic
			},
			  providerOrUrl: infuraAddress,
        pollingInterval: 8000
		});
   //console.log(provider);
   ethData = {address:provider.addresses[0], password: mnemonic}
  console.log(ethData);
  provider.engine.stop();
  res.status(200).json(ethData); 

});

app.post("/get-balance",async function(req,res){
	//req.body
  let password = req.body.password;
  let addresss = req.body.addresss;
  //console.log(req.body);
  var mnemonic = password;
    //var provider = new HDWalletProvider(mnemonic,infuraAddress);
    let provider = new HDWalletProvider({
      mnemonic: {
        phrase: mnemonic
      },
      providerOrUrl: infuraAddress,
      pollingInterval: 8000
    });
    var web3 = new Web3(provider);
    const ctx = getContract(addresss, web3);
    console.log("BALANCE OF = ", addresss);
    provider.engine.stop();
    const promise = await new Promise((rs, rj) => {
      ctx.methods.balanceOf(addresss).call(function (err, resData) {          
          if (err) res.status(200).json(err); 
          else {
            console.log(resData);
            res.status(200).json({status:"success",balance:resData}); 
            //rs(res);
          }
      });
    });
    return promise;

});

app.get("/get-eth-balance",async function(req,res){
	//req.body
  //console.log(data);
  let addresss = req.query.address;
  const web3 = new Web3(new Web3.providers.HttpProvider(infuraAddress));
	const promise = await new Promise((rs, rj) => {	
  	web3.eth.getBalance(addresss).then(function(result) {
      console.log(result/10e17)
      res.status(200).json({status:"success",balance:result/10e17}); // "Some User token"
    }).catch(function(err){
        res.status(200).json(err);
    })	
            
	});
  return promise;

});


app.post("/transfer-token",async function(req,res){
   
    let to = req.body.to;
    let password = req.body.password;
    let value = req.body.value;
    let mnemonic = password;     
   // var provider = new HDWalletProvider(mnemonic,infuraAddress);
    let provider = new HDWalletProvider({
			mnemonic: {
			  phrase: mnemonic
			},
			  providerOrUrl: infuraAddress,
        pollingInterval: 8000
		});

    var web3 = new Web3(provider);
    const ctx = getContract(provider.addresses[0] , web3);
    var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ET5QWNNS2B3JH51N4SHQ5KTR6BX4SE4VPJ';
    const gasPriceData = await request(url, async function (error, response, body) {
      var gasAvgPrice = 70;
      if (!error && response.statusCode == 200) 
      {
        results = JSON.parse(body);
        gasAvgPrice = results.result.ProposeGasPrice;
      }
      if(gasAvgPrice ==undefined){
        gasAvgPrice = 70;
      }
      console.log(gasAvgPrice);
      
      const tx = {
        from: provider.addresses[0],
        to: contractHash,
        gas: 60000,
        gasPrice: gasAvgPrice*1000000000, //70 Gwei
        //nonce: 869,
        data: ctx.methods.transfer(to,  value).encodeABI()
      };
      console.log(tx);
      var balance;
      await web3.eth.getBalance(provider.addresses[0]).then(function(result){
        console.log(result);
        balance = result;
      });

      provider.engine.stop();
      if(0.0010 <= balance/1000000000000000000) 
      {
          const signPromise =  web3.eth.signTransaction(tx, tx.from);
          signPromise.then(async (signedTx) => {

            web3.eth.sendSignedTransaction(signedTx.raw, function (err, transactionHash) {
            console.log(transactionHash);
              if(transactionHash){
                res.status(200).json({status:"success", message:transactionHash});
              }
              else{
                res.status(200).json({status:"failed", message:err});
              }
            });
          }).catch((err) => {
            console.log( err)
            res.status(200).json({status:"failed"});
          });
      }else {
        res.status(200).json({status:"failed", message:"Required Minimum Ether to send the transaction is 0.0010"});
      
      } 
      
    });

});

app.post("/transfer-token-with-callback",async function(req,res){
   
  let to = req.body.to;
  let password = req.body.password;
  let value = req.body.value;
  let mnemonic = password;     
 // var provider = new HDWalletProvider(mnemonic,infuraAddress);
  let provider = new HDWalletProvider({
    mnemonic: {
      phrase: mnemonic
    },
      providerOrUrl: infuraAddress,
      pollingInterval: 8000
  });

  var web3 = new Web3(provider);
  const ctx = getContract(provider.addresses[0] , web3);
  var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ET5QWNNS2B3JH51N4SHQ5KTR6BX4SE4VPJ';
  const gasPriceData = await request(url, async function (error, response, body) {
    var gasAvgPrice = 0;
    if (!error && response.statusCode == 200) 
    {
      results = JSON.parse(body);
      gasAvgPrice = results.result.ProposeGasPrice
    }else
    {
      gasAvgPrice = 70
    }
     console.log(gasAvgPrice);
    const tx = {
      from: provider.addresses[0],
      to: contractHash,
      gas: 60000,
      gasPrice: parseInt(gasAvgPrice)*1000000000, //70 Gwei
      //nonce: 869,
      data: ctx.methods.transfer(to,  value).encodeABI()
    };
    console.log(tx);
    var balance;
    await web3.eth.getBalance(provider.addresses[0]).then(function(result){
      console.log(result);
      balance = result;
    });

    provider.engine.stop();
    if(0.0010 <= balance/1000000000000000000) 
    {
        const signPromise =  web3.eth.signTransaction(tx, tx.from);
        signPromise.then(async (signedTx) => {

          web3.eth.sendSignedTransaction(signedTx.raw, function (err, transactionHash) {
          console.log(transactionHash);
            if(transactionHash){
              res.status(200).json({status:"success", message:transactionHash});
            }
            else{
              res.status(200).json({status:"failed", message:err});
            }
          }).once('sending', function(payload){'sending',console.log(payload);})
          .once('sent', function(payload){ console.log('sent',payload);})
          .once('transactionHash', function(hash){ console.log('transactionHash',hash);})
          .once('receipt', function(receipt){ console.log('receipt',receipt);})
          .on('confirmation', function(confNumber, receipt, latestBlockHash){ console.log('confirmation',confNumber, receipt, latestBlockHash);})
          .on('error', function(error){ console.log('error',error);});
        }).catch((err) => {
          console.log( err)
          res.status(200).json({status:"failed"});
        });
    }else {
      res.status(200).json({status:"failed", message:"Required Minimum Ether to send the transaction is 0.0010"});
    
    } 
    
  });

});
app.post("/user-transfer-token",async function(req,res){
   
  let to = req.body.to;
  let password = req.body.password;
  let value = req.body.value;
  let mnemonic = password;     
  //var provider = new HDWalletProvider(mnemonic,infuraAddress);
	let provider = new HDWalletProvider({
		mnemonic: {
		  phrase: mnemonic
		},
		  providerOrUrl: infuraAddress,
      pollingInterval: 8000
	});

  var web3 = new Web3(provider);
  const ctx = getContract(provider.addresses[0] , web3);
  var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ET5QWNNS2B3JH51N4SHQ5KTR6BX4SE4VPJ';
  const gasPriceData = await request(url, async function (error, response, body) {
    var gasAvgPrice = 0;
    if (!error && response.statusCode == 200) 
    {
      results = JSON.parse(body);
      gasAvgPrice = results.result.ProposeGasPrice
    }else
    {
      gasAvgPrice = 70
    }

    console.log(gasAvgPrice);
    const tx = {
      from: provider.addresses[0],
      to: contractHash,
      gas: 60000,
      gasPrice: parseInt(gasAvgPrice)*1000000000, //70 Gwei
      //nonce: 869,
      data: ctx.methods.transfer(to,  value).encodeABI()
    };
    console.log(tx);
    var balance;
    await web3.eth.getBalance(provider.addresses[0]).then(function(result){
      console.log(result);
      balance = result;
    });

    provider.engine.stop();
    if(0.0040 <= balance/1000000000000000000) 
    {
        const signPromise =  web3.eth.signTransaction(tx, tx.from);
        signPromise.then(async (signedTx) => {

          web3.eth.sendSignedTransaction(signedTx.raw, function (err, transactionHash) {
          console.log(err);
          console.log(transactionHash);
            if(transactionHash){
              res.status(200).json({status:"success", message:transactionHash});
            }
            else{
              res.status(200).json({status:"failed", message:err});
            }
          });
        }).catch((err) => {
          console.log( err)
          res.status(200).json({status:"failed"});
        });
    }else {
    res.status(200).json({status:"failed", message:"Required Minimum Ether to send the transaction is 0.0040"});
    }          
  });    

});

app.post("/transfer-ether",async function(req,res){
   
  let to = req.body.to;
  let password = req.body.password;
  let value = req.body.value;
  let mnemonic = password;     
  //var provider = new HDWalletProvider(mnemonic,infuraAddress);
	let provider = new HDWalletProvider({
		mnemonic: {
		  phrase: mnemonic
		},
		   providerOrUrl: infuraAddress,
       pollingInterval: 8000
	});
  var web3 = new Web3(provider);      
  //const ctx = getContract(provider.addresses[0] , web3);
  var url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ET5QWNNS2B3JH51N4SHQ5KTR6BX4SE4VPJ';
  const gasPriceData = await request(url, async function (error, response, body) {
    var gasAvgPrice = 0;
    if (!error && response.statusCode == 200) 
    {
      results = JSON.parse(body);
      gasAvgPrice = results.result.ProposeGasPrice
    }else
    {
      gasAvgPrice = 70
    }
    console.log(gasAvgPrice);

    const tx = {
      // this could be provider.addresses[0] if it exists
      from: provider.addresses[0],
      // target address, this could be a smart contract address
      to: to,
      // optional if you want to specify the gas limit
      //gas:2100,

       gas: 60000,
          gasPrice: parseInt(gasAvgPrice)*1000000000, //70 Gwei
          //nonce: 59,
      // optional if you are invoking say a payable function
      value: '0x' + dec2hex(convertETH(value, 'eth', 'wei'))
      // this encodes the ABI of the method and the arguements
      //data: ctx.methods.transferDuringIntialOffer(to,  value).encodeABI()
    };
    console.log(tx);
    //web3.eth.getGasPrice().then(async function(gasprice){
    var balance;
    await web3.eth.getBalance(provider.addresses[0]).then(function(result){
      console.log(result);
      balance = result;
    }); 
    provider.engine.stop();

    if(0.0040 <= balance/1000000000000000000) {

      const signPromise =  web3.eth.signTransaction(tx, tx.from);

      signPromise.then(async (signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.raw, function (err, transactionHash) {
        console.log(transactionHash);
        if(transactionHash){
          res.status(200).json({status:"success", message:transactionHash});
        }
        else{
          res.status(200).json({status:"failed", message:err});
        }
        });
      }).catch((err) => {
       console.log( err)
       res.status(200).json({status:"failed"});
        // do something when promise fails
       //  console.log(err);
      });
    }else {
      res.status(200).json({status:"failed", message:"Required Minimum Ether to send the transaction is 0.0040"});

    } 

  });
});

app.listen("3009",function(){
  console.log("LISTENING ON PORT 3009");
});