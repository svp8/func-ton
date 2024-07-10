import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
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
        const result = await sc.sendWithAddress(
            user2.getSender(),
            toNano('1'),
            12345n,
            user3.address
        );
        expect(result.transactions).toHaveTransaction({
            from: sc.address,
            to: user3.address,
            success: true,
        })
        // expect(result.transactions).toHaveTransaction({
        //     from: sc.address,
        //     to: deployer.address,
        //     success: true,
        // })
    });
});