import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary, DictionaryValue } from '@ton/core';

export type FuncArrayConfig = {
};

export function funcArrayConfigToCell(config: FuncArrayConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class FuncArray implements Contract {
    constructor(readonly address: Address, readonly init?: {}) { }

    static createFromAddress(address: Address) {
        return new FuncArray(address);
    }

    static createFromConfig(config: FuncArrayConfig, code: Cell, workchain = 0) {
        const data = funcArrayConfigToCell(config);
        const init = {code,data};
        return new FuncArray(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0,32).storeUint(0,64).endCell(),
        });
    }

    async sendAddElement(
        provider: ContractProvider,
        via: Sender,
        opts: {
            element: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.element, 32)
                .endCell(),
        });
    }

    async getArray(provider: ContractProvider) {
        const result = await provider.get('get_array', []);
        console.log(result.stack.readCell());
       let map= Dictionary.load(Dictionary.Keys.Uint(32), Dictionary.Values.Buffer(32),result.stack.readCell().beginParse());
        return map;
    }


}
