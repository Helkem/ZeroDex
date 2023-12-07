import { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, RadioChangeEvent } from "antd";
import { useAccount } from "wagmi";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import SwapButton from "./SwapButton";
import { useConnectModal } from "@rainbow-me/rainbowkit";

type Token = {
  name: string;
  ticker: string;
  img: string;
  address: string;
};

type Prices = {
  ratio: number;
};

type SwapProps = {
  toast: any;
};

export default function Swap({ toast }: SwapProps) {
  const [slippage, setSlippage] = useState<number>(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<number>(0);
  const [tokenTwoAmount, setTokenTwoAmount] = useState<number>(0);
  const [tokenOne, setTokenOne] = useState<Token>(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState<Token>(tokenList[1]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [prices, setPrices] = useState<Prices | undefined>();
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  function swapToken() {
    const loadingToast = toast.loading(
      `Swapping ${tokenOneAmount} ${tokenOne.ticker} for ${tokenTwoAmount} ${tokenTwo.ticker}`
    );

    setTimeout(() => {
      toast.dismiss(loadingToast);

      toast.success(
        `Swapped ${tokenOneAmount} ${tokenOne.ticker} for ${tokenTwoAmount} ${tokenTwo.ticker}`
      );
    }, 2000);
  }

  function handleSlippageChange(e: RadioChangeEvent) {
    setSlippage(Number(e.target.value));
  }

  function changeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = Number(e.target.value);
    setTokenOneAmount(inputValue);
    if (e.target.value && prices) {
      const calculatedAmount = (inputValue * prices.ratio).toFixed(2);
      setTokenTwoAmount(parseFloat(calculatedAmount));
    } else {
      setTokenTwoAmount(0);
    }
  }

  function switchTokens() {
    setPrices(undefined);
    setTokenOneAmount(0);
    setTokenTwoAmount(0);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset: number) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i: number) {
    setPrices(undefined);
    setTokenOneAmount(0);
    setTokenTwoAmount(0);
    setIsOpen(false);

    if (changeToken === 1 && tokenList[i] !== tokenTwo) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else if (changeToken === 2 && tokenList[i] !== tokenOne) {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    } else if (changeToken === 2 && tokenList[i] === tokenOne) {
      switchTokens();
    } else if (changeToken === 1 && tokenList[i] === tokenTwo) {
      switchTokens();
    }
  }

  async function fetchPrices(one: string, two: string) {
    try {
      const res = await axios.get<Prices>(`http://localhost:3000/tokenPrice`, {
        params: { addressOne: one, addressTwo: two },
      });
      setPrices(res.data);
    } catch (err) {
      throw new Error(`Error fetching prices: ${err}`);
    }
  }

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  const settings: React.ReactNode = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title='Select a token'
      >
        <div className='modalContent'>
          {tokenList?.map((token, i) => (
            <div
              className={
                (tokenList[i] === tokenOne && changeToken === 1) ||
                (tokenList[i] === tokenTwo && changeToken === 2)
                  ? `tokenChoiceDisabled`
                  : `tokenChoice`
              }
              key={i}
              onClick={
                (tokenList[i] === tokenOne && changeToken === 1) ||
                (tokenList[i] === tokenTwo && changeToken === 2)
                  ? () => {}
                  : () => modifyToken(i)
              }
            >
              <img src={token.img} alt={token.ticker} className='tokenLogo' />
              <div className='tokenChoiceNames'>
                <div className='tokenName'>{token.name}</div>
                <div className='tokenTicker'>{token.ticker}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
      <div className='tradeBox'>
        <div className='tradeBoxHeader'>
          <h4>Swap</h4>
          <Popover
            content={settings}
            title='Settings'
            trigger='click'
            placement='bottomRight'
          >
            <SettingOutlined className='cog' />
          </Popover>
        </div>
        <div className='inputs'>
          <Input
            placeholder={"0"}
            value={tokenOneAmount}
            onChange={changeAmount}
            type='number'
          />
          <Input
            placeholder={"0"}
            value={tokenTwoAmount}
            disabled={true}
            type='number'
          />
          <div className='assetOne' onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt='assetOneLogo' className='assetLogo' />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className='switchButton' onClick={switchTokens}>
            <ArrowDownOutlined className='switchArrow' />
          </div>
          <div className='assetTwo' onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt='assetTwoLogo' className='assetLogo' />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        {isConnected ? (
          <SwapButton
            disabled={!tokenOneAmount || !isConnected}
            onClick={swapToken}
          >
            Swap
          </SwapButton>
        ) : (
          <SwapButton disabled={false} onClick={openConnectModal}>
            Connect Wallet
          </SwapButton>
        )}
      </div>
    </>
  );
}
