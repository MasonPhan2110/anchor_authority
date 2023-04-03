import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { Authority } from "../target/types/authority";
const { SystemProgram } = anchor.web3;

describe("authority", () => {
  const provider = anchor.AnchorProvider.local()
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const counter = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Authority as Program<Authority>;

  it("Create a counter!", async () => {
    let balance = await provider.connection.getBalance(counter.publicKey);
    console.log("balance of Counter: ", balance);

    balance = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("balance of Wallet: ", balance);
    
    await program.methods
    .create(provider.wallet.publicKey)
    .accounts({
      counter: counter.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([counter])
    .rpc()

    balance = await provider.connection.getBalance(counter.publicKey);
    console.log("balance of Counter: ", balance);

    balance = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("balance of Wallet: ", balance);

    let counterAccount = await program.account.counter.fetch(counter.publicKey);

    
    assert.ok(counterAccount.authority.equals(provider.wallet.publicKey));
    assert.ok(counterAccount.count.toNumber() === 0);
  });
  it("Update a counter", async () => {
    await program.methods
    .increment()
    .accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey,
    })
    .rpc();

    const counterAccount = await program.account.counter.fetch(
      counter.publicKey
    );

    assert.ok(counterAccount.authority.equals(provider.wallet.publicKey));
    assert.ok(counterAccount.count.toNumber() == 1);
  });
});
