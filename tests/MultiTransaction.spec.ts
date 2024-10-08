import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees,prettyLogTransactions } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { MultiTransaction } from '../wrappers/MultiTransaction';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('MultiTransaction', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('MultiTransaction');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sc: SandboxContract<MultiTransaction>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        sc = blockchain.openContract(
            MultiTransaction.createFromConfig(
                {
                    address: deployer.address
                },
                code
            )
        );
        await sc.sendDeploy(deployer.getSender(),toNano("100"),1221n);
    });


    it('should send to address-owner and address-receiver', async () => {
        let user2 = await blockchain.treasury('user2');
        let user3 = await blockchain.treasury('user3');
        const address = user2.address;
        console.log(sc.address)
        const result = await sc.sendWithAddress(
            user2.getSender(),
            toNano('1'),
            12345n,
            user3.address
        );
        let owner =await sc.getOwner();
        console.log(owner);
        expect(result.transactions).toHaveTransaction({
            from: sc.address,
            to: user3.address,
            success: true,
            value: (x) => (x ? toNano('0.99') <= x && x <= toNano('1') : false)
        })
        const result2 = await sc.sendGetTon(
            user2.getSender(),
            toNano('1'),
            12346n
        );
        expect(result2.transactions).toHaveTransaction({
            from: sc.address,
            to: deployer.address,
            success: true,
        })
    });
});