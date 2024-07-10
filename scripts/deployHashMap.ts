import { toNano } from '@ton/core';
import { HashMap } from '../wrappers/HashMap';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const hashMap = provider.open(
        HashMap.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('HashMap')
        )
    );

    await hashMap.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(hashMap.address);

    console.log('ID', await hashMap.getID());
}
