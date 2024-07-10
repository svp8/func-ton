import { toNano } from '@ton/core';
import { MultiTransaction } from '../wrappers/MultiTransaction';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const multiTransaction = provider.open(
        MultiTransaction.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('MultiTransaction')
        )
    );

    await multiTransaction.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(multiTransaction.address);

    console.log('ID', await multiTransaction.getID());
}
