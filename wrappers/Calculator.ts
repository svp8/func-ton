import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type CalculatorConfig = {
};

export function calculatorConfigToCell(config: CalculatorConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class Calculator implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Calculator(address);
    }

    static createFromConfig(config: CalculatorConfig, code: Cell, workchain = 0) {
        const data = calculatorConfigToCell(config);
        const init = { code, data };
        return new Calculator(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32)
            .storeUint(1,64).endCell(),
        });
    }

    async sendCalculate(
        provider: ContractProvider,
        via: Sender,
        opts: {
            statement: string;
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
                .storeStringTail(opts.statement)
                .endCell(),
        });
    }

    // async getCounter(provider: ContractProvider) {
    //     const result = await provider.get('get_counter', []);
    //     return result.stack.readNumber();
    // }
}
