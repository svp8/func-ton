import { toNano } from '@ton/core';
import { Manager } from '../wrappers/Manager';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const manager = provider.open(
        Manager.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Manager')
        )
    );

    await manager.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(manager.address);

    console.log('ID', await manager.getID());
}
