import Safe from "@safe-global/protocol-kit";
import { Eip1193Provider } from "@safe-global/protocol-kit";

export const safeAddress = "0x2e25A2f6bC2C0b7669DFB25180Ed57e07dAabe9e"

export const getSafeKit = async (provider: any): Promise<Safe> => {
    const safeKit = await Safe.init({
        provider: provider as Eip1193Provider,
        safeAddress: safeAddress
    })

    return safeKit
}