import { Address, Slice,TupleItemSlice, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type HashMapConfig = {

};

export function hashMapConfigToCell(config: HashMapConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class HashMap implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new HashMap(address);
    }

    static createFromConfig(config: HashMapConfig, code: Cell, workchain = 0) {
        const data = hashMapConfigToCell(config);
        const init = { code, data };
        return new HashMap(contractAddress(workchain, init), init);
    }

    async sendSet(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint;
        key: bigint;
        value: Slice;
        validUntil: bigint;
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.key, 256)
                .storeUint(opts.validUntil, 64)
                .storeSlice(opts.value)
                .endCell(),
        });
    }
    async sendClearOldValues(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: bigint;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeUint(opts.queryId, 64).endCell(),
        });
    }

    async getByKey(provider: ContractProvider, key: bigint): Promise<[bigint, Slice]> {
        const result = (await provider.get('get_key', [{ type: 'int', value: key }])).stack;
        return [result.readBigNumber(), (result.peek() as TupleItemSlice).cell.asSlice()];
    }

}
