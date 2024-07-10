import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type MultiTransactionConfig = {
    address: Address;
};

export function multiTransactionConfigToCell(config: MultiTransactionConfig): Cell {
    return beginCell().storeAddress(config.address).endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class MultiTransaction implements Contract {
   constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

       static createFromAddress(address: Address) {
           return new  MultiTransaction(address);
       }

       static createFromConfig(config:  MultiTransactionConfig, code: Cell, workchain = 0) {
           const data =  multiTransactionConfigToCell(config);
           const init = { code, data };
           return new  MultiTransaction(contractAddress(workchain, init), init);
       }

       async sendWithAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint, newAddress: Address) {
           await provider.internal(via, {
               value,
               sendMode: SendMode.PAY_GAS_SEPARATELY,
               body: beginCell().storeUint(1, 32).storeUint(queryId, 64).storeAddress(newAddress).endCell(),
           });
       }
       async sendDeploy(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32).storeUint(queryId, 64).endCell(),
        });
    }
}
