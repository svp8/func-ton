import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano,beginCell } from '@ton/core';
import { HashMap } from '../wrappers/HashMap';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('HashMap', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('HashMap');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let hashmap: SandboxContract<HashMap>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        blockchain.now = 500;
    
        deployer = await blockchain.treasury('deployer');
    
        hashmap = blockchain.openContract(
            HashMap.createFromConfig(
                {},
                code
            )
        );
    
        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 1n,
            validUntil: 1000n,
            value: beginCell().storeUint(123, 16).endCell().asSlice(),
        });
    
        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 2n,
            validUntil: 2000n,
            value: beginCell().storeUint(234, 16).endCell().asSlice(),
        });
    
        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 3n,
            validUntil: 3000n,
            value: beginCell().storeUint(345, 16).endCell().asSlice(),
        });
    });

    it('should increase counter', async () => {
        let [validUntil, value] = await hashmap.getByKey(1n);
        expect(validUntil).toEqual(1000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123, 16).endCell().asSlice()
        );
    
        [validUntil, value] = await hashmap.getByKey(2n);
        expect(validUntil).toEqual(2000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(234, 16).endCell().asSlice()
        );
    
        [validUntil, value] = await hashmap.getByKey(3n);
        expect(validUntil).toEqual(3000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(345, 16).endCell().asSlice()
        );
    });
    it('should throw on not found key', async () => {
        await expect(hashmap.getByKey(123n)).rejects.toThrow();
    });
    it('should clear old values', async () => {
        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
        });
    
        let [validUntil, value] = await hashmap.getByKey(1n);
        expect(validUntil).toEqual(1000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123, 16).endCell().asSlice()
        );
    
        blockchain.now = 1001;
    
        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
        });
    
        await expect(hashmap.getByKey(1n)).rejects.toThrow();
    
        [validUntil, value] = await hashmap.getByKey(2n);
        expect(validUntil).toEqual(2000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(234, 16).endCell().asSlice()
        );
    
        [validUntil, value] = await hashmap.getByKey(3n);
        expect(validUntil).toEqual(3000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(345, 16).endCell().asSlice()
        );
    
        blockchain.now = 3001;
    
        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
        });
    
        await expect(hashmap.getByKey(2n)).rejects.toThrow();
        await expect(hashmap.getByKey(3n)).rejects.toThrow();
    });

    it('should throw on wrong opcode', async () => {
        const result = await deployer.send({
            to: hashmap.address,
            value: toNano('0.05'),
            body: beginCell().storeUint(123, 32).storeUint(123, 64).endCell(),
        });
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: hashmap.address,
            exitCode: 12,
        });
    });
});
