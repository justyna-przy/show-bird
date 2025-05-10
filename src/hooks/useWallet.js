import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { ethers } from "ethers";

const OWNER_ADDRESS = "0xYourDeployerAddressHere"; // ← change to real owner

const WalletCtx = createContext(null);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(addr);
  }, []);

  const disconnect = () => setAddress(null);

  const load = (addr) => setAddress(addr); // for Create / Import dialogs

  useEffect(() => {
    if (window.ethereum?.selectedAddress) setAddress(window.ethereum.selectedAddress);
  }, []);

  return (
    <WalletCtx.Provider
      value={{
        address,
        isConnected: !!address,
        owner: address?.toLowerCase() === OWNER_ADDRESS.toLowerCase(),
        connect,
        disconnect,
        load,
      }}
    >
      {children}
    </WalletCtx.Provider>
  );
};

export const useWallet = () => useContext(WalletCtx);
