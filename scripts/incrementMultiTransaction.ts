import { Address, toNano } from '@ton/core';
import { MultiTransaction } from '../wrappers/MultiTransaction';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('MultiTransaction address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const multiTransaction = provider.open(MultiTransaction.createFromAddress(address));

    const counterBefore = await multiTransaction.getCounter();

    await multiTransaction.sendIncrease(provider.sender(), {
        increaseBy: 1,
        value: toNano('0.05'),
    });

    ui.write('Waiting for counter to increase...');

    let counterAfter = await multiTransaction.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await multiTransaction.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
