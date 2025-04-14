import { useEffect, useState, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, Copy, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "@/hooks";
import { LedgerConnector } from "@/lib/connectors/ledger-connector";

interface LedgerAccount {
    address: string;
    path: string;
    index: number;
}

interface LedgerConnectionScreenProps {
    onConnect: () => void;
    onError: () => void;
}

export const LedgerConnectionScreen = ({ onConnect, onError }: LedgerConnectionScreenProps) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
    const [currentPage, setCurrentPage] = useState(0);

    const { account, connect, connectors } = useAccount();
    const { toast } = useToast();

    const isConnectedRef = useRef(false);

    const accountsPerPage = 5;

    useEffect(() => {
        if (account?.isConnected) {
            onConnect();
        } else {
            if (!isConnectedRef.current) {
                handleLedgerConnect();
                isConnectedRef.current = true;
            }
        }
    }, [account?.isConnected]);

    const handleLedgerConnect = async () => {
        setIsConnecting(true);
    
        try {
          const ledgerConnector = connectors["ledger"] as LedgerConnector;
          const accounts = await ledgerConnector.fetchAccounts();
          console.log("accounts", accounts);
          setLedgerAccounts(accounts);
        } catch (error) {
          console.error("Connection error:", error);
          toast({
            title: "Connection Failed",
            description:
              error instanceof Error
                ? error.message
                : "An unknown error occurred. Please try again.",
            variant: "destructive",
          });
          onError();
        } finally {
          setIsConnecting(false);
        }
    };

    const handleLedgerAccountSelect = async (selectedAccount: LedgerAccount) => {
        try {
          await connect("ledger", selectedAccount.index);
        } catch (error) {
          console.error("Ledger connection error:", error);
          toast({
            title: "Connection Failed",
            description: "There was an error connecting your Ledger account. Please try again.",
            variant: "destructive",
          });
          onError();
        }
    };
    
    const paginatedAccounts = ledgerAccounts.slice(
      currentPage * accountsPerPage,
      (currentPage + 1) * accountsPerPage
    );

    if (isConnecting) {
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Connecting to Ledger...</p>
          </div>
        );
      }
    
      return (
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold">Select Ledger Account</h3>
          {paginatedAccounts.map((account, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="mr-2">
                <p className="font-mono text-sm">{account.address}</p>
                <p className="text-xs text-gray-500">Index: {account.index}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(account.address)
                    toast({
                      title: "Copied to clipboard",
                      description: "The address has been copied to your clipboard.",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => handleLedgerAccountSelect(account)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    Math.ceil(ledgerAccounts.length / accountsPerPage) - 1,
                    prev + 1
                  )
                )
              }
              disabled={(currentPage + 1) * accountsPerPage >= ledgerAccounts.length}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      );
}