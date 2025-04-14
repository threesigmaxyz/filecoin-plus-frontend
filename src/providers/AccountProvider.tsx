"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useConnect as useWagmiConnect, useDisconnect as useWagmiDisconnect, useAccount as useWagmiAccount, useSwitchChain } from "wagmi";

import { AccountContext } from "@/contexts/AccountContext";

import { Connector } from "@/types/connector";
import { LedgerConnector } from "@/lib/connectors/ledger-connector";
import { FilsnapConnector } from "@/lib/connectors/filsnap-connector";
import { Account, AccountRole } from "@/types/account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VerifyAPI } from "@keyko-io/filecoin-verifier-tools";
import { env } from "@/config/environment";
import { injected } from "wagmi/connectors";
import { Eip1193Provider } from "@safe-global/protocol-kit";
import { getSafeKit } from "@/lib/safe";

const queryClient = new QueryClient();

export const AccountProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  
  // RKH connectors
  const [currentConnector, setCurrentConnector] = useState<Connector | null>(null);

  // MetaAllocator connectors
  const { address: wagmiAddress, status: wagmiStatus, connector: wagmiConnector } = useWagmiAccount();
  const { chains, switchChain: wagmiSwitchChain } = useSwitchChain()
  const { connect: wagmiConnect } = useWagmiConnect()
  const { disconnect: wagmiDisconnect } = useWagmiDisconnect()

  useEffect(() => {
    if (wagmiStatus === "connected") {
      wagmiSwitchChain({
        chainId: chains[0].id
      })
      
      const setupSafe = async () => {
        try {
          const provider = await wagmiConnector?.getProvider();
          const safeKit = await getSafeKit(provider);
          const maOwners = await safeKit.getOwners();

          setAccount({
            address: wagmiAddress,
            index: 0,
            isConnected: true,
            role: maOwners.includes(wagmiAddress) ? AccountRole.METADATA_ALLOCATOR : AccountRole.GUEST,
            wallet: {
              type: "metamask",
              sign: async (_message: any, _indexAccount: number) => "0x00",
              getAccounts: async () => {
                return [wagmiAddress];
              }
            }
          });
        } catch (error) {
          console.error("Error setting up Safe connection:", error);
        }
      };

      setupSafe();
    }
  }, [wagmiStatus, wagmiAddress, wagmiConnector]);

  // Registry of available connectors
  const connectors: { [key: string]: Connector } = {
    ledger: new LedgerConnector(),
    filsnap: new FilsnapConnector(),
  };

  const loadPersistedAccount = useCallback(async () => {}, [])

  /**
   * Connects using the specified connector.
   * @param connectorName The name of the connector ('ledger' or 'metamask').
   * @param accountIndex The index of the account to connect to on the ledger.
   */
  const connect = useCallback(
    async (connectorName: string, accountIndex?: number) => {
      try {
        switch (connectorName) {
          case "metamask":
            await wagmiConnect({
              connector: injected()
            });
            break;
          case "ledger":
            const ledgerConnector = new LedgerConnector(accountIndex);
            const ledgerAccount = await ledgerConnector.connect();
            setAccount(ledgerAccount);
            setCurrentConnector(ledgerConnector);
            break;
          case "filsnap":
            const filsSnapConnector = new FilsnapConnector();
            const filsSnapAccount = await filsSnapConnector.connect();
            setAccount(filsSnapAccount);
            setCurrentConnector(filsSnapConnector);
            break;
        }
      } catch (error) {
        throw error;
      }
    },
    [connectors]
  );

  /**
   * Disconnects the current connector.
   */
  const disconnect = useCallback(async () => {
    // handle MetaAllocator disconnect
    if (account?.role === AccountRole.METADATA_ALLOCATOR || account?.role === AccountRole.GUEST) {
      await wagmiDisconnect();
      setAccount(null);
    }
    
    // handle RKH disconnect
    else if (currentConnector) {
      await currentConnector.disconnect();
      setCurrentConnector(null);
      setAccount(null);
    }
  }, [account, currentConnector]);

  const proposeAddVerifier = useCallback(async (verifierAddress: string, datacap: string) => {
    if (!account?.wallet) {
      throw new Error("Wallet not connected");
    }

    const api = new VerifyAPI(
      VerifyAPI.browserProvider(env.rpcUrl, {
        token: async () => {
          return env.rpcToken;
        },
      }),
      account.wallet,
      env.useTestData // (false => Mainnet, true => Testnet)
    );

    const dataCap = parseFloat(datacap);
    const fullDataCap = BigInt(dataCap * 1000000000000);
    let verifierAccountId = verifierAddress;
    if (verifierAccountId.length < 12) {
      verifierAccountId = await api.actorKey(verifierAccountId)
    }

    console.log("account", account);
    console.log("account.wallet", account.wallet);
    console.log("verifierAddress", verifierAddress);
    console.log("verifierAccountId", verifierAccountId);
    console.log("fullDataCap", fullDataCap);
    
    const messageId = await api.proposeVerifier(
      verifierAccountId,
      fullDataCap,
      account.index ?? 0,
      account.wallet
    );
    return messageId;
  }, [currentConnector]);

  const acceptVerifierProposal = useCallback(async (verifierAddress: string, datacap: string, fromAccount: string, transactionId: number) => {
    if (!account?.wallet) {
      throw new Error("Wallet not connected");
    }

    const api = new VerifyAPI(
      VerifyAPI.browserProvider(env.rpcUrl, {
        token: async () => {
          return env.rpcToken;
        },
      }),
      account.wallet,
      env.useTestData // (false => Mainnet, true => Testnet)
    );

    const dataCap = parseFloat(datacap);
    const fullDataCap = BigInt(dataCap * 1000000000000);
    let verifierAccountId = verifierAddress;
    if (verifierAccountId.length < 12) {
      verifierAccountId = await api.actorKey(verifierAccountId)
    }

    const messageId = await api.approveVerifier(
      verifierAccountId,
      fullDataCap,
      fromAccount,
      transactionId,
      account.index ?? 0,
      account.wallet
    )

    return messageId;
  }, [account]);
  

  return (
    <QueryClientProvider client={queryClient}>
      <AccountContext.Provider
        value={{
          account,
          connect,
          disconnect,
          connectors,
          proposeAddVerifier,
          acceptVerifierProposal,
          loadPersistedAccount,
        }}
      >
        {children}
      </AccountContext.Provider>
    </QueryClientProvider>
    
  );
};
