"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "../../hooks/useAccount";
import { ConnectWalletDialog } from "./ConnectWalletDialog";

export default function ConnectWalletButton() {
  const { account, disconnect } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  // If an account is connected, display the connected state
  if (account) {
    return (
      <Button onClick={disconnect}>
        Connected: {account.address.slice(0, 6)}...
        {account.address.slice(-4)}
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Connect Wallet</Button>
      <ConnectWalletDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleClose={handleClose}
      />
    </>
  )
}
