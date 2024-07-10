import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano,beginCell } from '@ton/core';
import { Manager } from '../wrappers/Manager';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';

describe('Manager', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Manager');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sc: SandboxContract<Manager>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        sc = blockchain.openContract(
            Manager.createFromConfig(
                {
                    manager: deployer.address
                },
                code
            )
        );
    });


    it('should change address if manager-sender', async () => {
        const address = randomAddress();
        const result = await sc.sendChangeAddress(
            deployer.getSender(),
            toNano('0.01'),
            12345n,
            address
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: sc.address,
            success: true,
        })
    });

    it('should not change saved address by anyone else', async () => {
        let user = await blockchain.treasury('user');
        const address = randomAddress();
        const result = await sc.sendChangeAddress(
            user.getSender(),
            toNano('0.01'),
            12345n,
            address
        );

        expect(result.transactions).toHaveTransaction({
            from: user.address,
            to: sc.address,
            success: false,
        });
    });

    it('should change address if manager-sender', async () => {
        const address = randomAddress();
        await sc.sendChangeAddress(
            deployer.getSender(),
            toNano('0.01'),
            12345n,
            address
        );
        let user = await blockchain.treasury('user');
        const result = await sc.sendRequestAddress(
            user.getSender(),
            toNano('0.01'),
            12345n
        );
        expect(result.transactions).toHaveTransaction({
            from: sc.address,
            to: user.address,
            success: true,
            body: beginCell()
            .storeUint(3, 32)
            .storeUint(12345n, 64)
            .storeAddress(deployer.address)
            .storeAddress(address)
            .endCell(),
        })
    });
    // it('should throw on any other opcode', async () => {
    //     const result = await deployer.send({
    //         to: sc.address,
    //         value: toNano('0.01'),
    //         body: beginCell().storeUint(5, 32).storeUint(12345n, 64).endCell(),
    //     });
    //     expect(result.transactions).toHaveTransaction({
    //         from: deployer.address,
    //         to: sc.address,
    //         exitCode: 3,
    //     });
    // });
});
