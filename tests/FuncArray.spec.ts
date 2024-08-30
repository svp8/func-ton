import { Blockchain, SandboxContract, TreasuryContract, prettyLogTransactions, printTransactionFees } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { FuncArray } from '../wrappers/FuncArray';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('FuncArray', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('FuncArray');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let funcArray: SandboxContract<FuncArray>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        funcArray = blockchain.openContract(
            FuncArray.createFromConfig(
                {},
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await funcArray.sendDeploy(deployer.getSender(), toNano('0.05'));
        prettyLogTransactions(deployResult.transactions);
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: funcArray.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and funcArray are ready to use
    });

    it('should add 1 to array', async () => {
        const res = await funcArray.sendAddElement(deployer.getSender(), {
            element: 1, value: toNano(1), queryID: 123
        });
        printTransactionFees(res.transactions)
        expect(res.transactions).toHaveTransaction({
            from: deployer.address,
            to: funcArray.address,
            success: true,
        });
        let arr = await funcArray.getArray();
        expect(arr).toHaveLength(1);
        expect(arr[0]).toEqual(1);
    });
});
