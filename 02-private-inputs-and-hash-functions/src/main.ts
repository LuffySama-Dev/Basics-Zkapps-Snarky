import { IncrementSecret } from './IncrementSecret.js';
import { Field, Mina, PrivateKey, AccountUpdate } from 'snarkyjs';

console.log(`Snarky is Loaded !!!`);

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const salt = Field.random();

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new IncrementSecret(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.initState(salt, Field(750));
});

await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

const num0 = zkAppInstance.x.get();
console.log(`Initial state of the x is ${num0} .`);

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.incrementSecret(salt, Field(750));
});
await txn1.prove();
await txn1.sign([senderKey]).send();

const num1 = zkAppInstance.x.get();
console.log(`Updated state of x is ${num1} .`);

console.log(`Snarky Unloaded !!`);
