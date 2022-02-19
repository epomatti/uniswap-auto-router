import { AlphaRouter, ChainId } from '@uniswap/smart-order-router';
import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { ethers, BigNumber } from "ethers";
import JSBI from 'jsbi';

import dotenv from 'dotenv';

dotenv.config();

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
const MY_ADDRESS = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B';
const web3Provider = new ethers.providers.JsonRpcProvider(
  process.env.ETHEREUM_NODE
);

const router = new AlphaRouter({ chainId: 1, provider: web3Provider });

const WETH = new Token(
  1,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether'
);

const USDC = new Token(
  ChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C'
);

const typedValueParsed = '100000000000000000000'
const wethAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(typedValueParsed));

const route = await router.route(
  wethAmount,
  USDC,
  TradeType.EXACT_INPUT,
  {
    recipient: MY_ADDRESS,
    slippageTolerance: new Percent(5, 100),
    deadline: 100
  }
);

if(route === null) {
  throw Error('Route is null')
}

console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);

if(route.methodParameters === undefined) {
  throw Error('Route is null')
}

const transaction = {
  data: route.methodParameters.calldata,
  to: V3_SWAP_ROUTER_ADDRESS,
  value: BigNumber.from(route.methodParameters.value),
  from: MY_ADDRESS,
  gasPrice: BigNumber.from(route.gasPriceWei),
};

const signer = web3Provider.getSigner();

const response = await signer.sendTransaction(transaction);

console.log(response);

// await web3Provider.sendTransaction(transaction);