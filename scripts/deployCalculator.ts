import { toNano } from '@ton/core';
import { Calculator } from '../wrappers/Calculator';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const calculator = provider.open(
        Calculator.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('Calculator')
        )
    );

    await calculator.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(calculator.address);

    console.log('ID', await calculator.getID());
}
