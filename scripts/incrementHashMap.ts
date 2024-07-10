import { Address, toNano } from '@ton/core';
import { HashMap } from '../wrappers/HashMap';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('HashMap address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const hashMap = provider.open(HashMap.createFromAddress(address));

    const counterBefore = await hashMap.getCounter();

    await hashMap.sendIncrease(provider.sender(), {
        increaseBy: 1,
        value: toNano('0.05'),
    });

    ui.write('Waiting for counter to increase...');

    let counterAfter = await hashMap.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await hashMap.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
