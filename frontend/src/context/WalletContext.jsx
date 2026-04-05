import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to use this feature.");
            return;
        }

        setIsConnecting(true);
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const network = await browserProvider.getNetwork();
            const browserSigner = await browserProvider.getSigner();

            setProvider(browserProvider);
            setAccount(accounts[0]);
            setSigner(browserSigner);
            setChainId(network.chainId);

            // Network Check (Updated to 1336 to match your manual edit)
            if (network.chainId !== 1336n) {
                alert("Please switch your MetaMask network to Forensic Node (Chain ID: 1336)");
            }
        } catch (error) {
            console.error("Wallet connection failed:", error);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setChainId(null);
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) setAccount(accounts[0]);
                else disconnectWallet();
            });

            window.ethereum.on('chainChanged', (hexChainId) => {
                window.location.reload();
            });
        }
    }, []);

    return (
        <WalletContext.Provider value={{ 
            account, 
            provider, 
            signer, 
            chainId, 
            connectWallet, 
            disconnectWallet, 
            isConnecting 
        }}>
            {children}
        </WalletContext.Provider>
    );
};
