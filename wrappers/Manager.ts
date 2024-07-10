import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type ManagerConfig = {
    manager: Address;
};

export function managerConfigToCell(config: ManagerConfig): Cell {
    return beginCell().storeAddress(config.manager).storeUint(0, 2).endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class Manager implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Manager(address);
    }

    static createFromConfig(config: ManagerConfig, code: Cell, workchain = 0) {
        const data = managerConfigToCell(config);
        const init = { code, data };
        return new Manager(contractAddress(workchain, init), init);
    }

    async sendChangeAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint, newAddress: Address) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(1, 32).storeUint(queryId, 64).storeAddress(newAddress).endCell(),
        });
    }

    async sendRequestAddress(provider: ContractProvider, via: Sender, value: bigint, queryId: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(queryId, 64).endCell(),
        });
    }
}
