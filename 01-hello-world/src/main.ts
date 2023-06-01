import { Square } from './Square.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'snarkyjs';

console.log('Snarky is Loaded !!!!');

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new Square(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
const num0 = zkAppInstance.num.get();
console.log(`Initial value of the num is ${num0.toString()} .`);

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.updateValue(Field(9));
});
await txn1.prove();
await txn1.sign([senderKey]).send();
const num1 = zkAppInstance.num.get();
console.log(`Value after updating is ${num1.toString()} .`);

try {
  const txn2 = await Mina.transaction(senderAccount, () => {
    zkAppInstance.updateValue(Field(80));
  });
  await txn2.prove();
  await txn2.sign([senderKey]).send();
} catch (er: any) {
  console.error(er.message);
}

const num2 = zkAppInstance.num.get();
console.log(`Value after transaction 2 is ${num2.toString()} .`);

const txn3 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.updateValue(Field(81));
});
await txn3.prove();
await txn3.sign([senderKey]).send();

const num3 = zkAppInstance.num.get();
console.log(`Value after transaction 3 is ${num3.toString()} .`);

console.log('Snarky is Unloaded !!!!');
