import { toNano } from '@ton/core';
import { FuncArray } from '../wrappers/FuncArray';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const funcArray = provider.open(
        FuncArray.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('FuncArray')
        )
    );

    await funcArray.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(funcArray.address);

    console.log('ID', await funcArray.getID());
}
