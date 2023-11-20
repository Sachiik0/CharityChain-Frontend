import React, {useState, useEffect} from 'react';
import './App.css';
import * as anchor from '@project-serum/anchor'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import idl from './idl.json'
import { Buffer } from 'buffer';
import * as utf8 from 'utf8';



const {SystemProgram, Keypair} = anchor.web3
const programID = new PublicKey(idl.metadata.address)
console.log(programID,'programID set correctly')
const network = clusterApiUrl('devnet')
const opts = {preflightCommitment: 'processed'}
globalThis.Buffer = Buffer; 


function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [inputName, setInputName] = useState(' ');
  const [inputDesc, setInputDesc] = useState(' ');
  const [inputDonation, setInputDonation] = useState(0);

  const getProvider = () =>{
    const connection = new Connection(network, opts.preflightCommitment)
    const provider = new anchor.AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment,
    )
    console.log(provider, 'provider set correctly')
    return provider
  } 
    
  const checkIfWalletConnected = async () => {
      try {
        const solana = window.solana;
        if (solana) {
          if (solana.isPhantom) {
            console.log('Phantom wallet found');
            const res = await solana.connect({ onlyIfTrusted: true });
            console.log('Connected with publicKey', res.publicKey.toBase58());
            setWalletAddress(res.publicKey.toBase58());
          }
        } else {
          alert('Wallet not found');
        }
      } catch (error) {
        console.log(error);
      }
  }

  const connectWallet = async () => {
    try {
      const solana = window.solana;
      const res = await solana.connect();
      console.log('Connected with publicKey', res.publicKey.toBase58());
      setWalletAddress(res.publicKey.toBase58());
    } catch (error) {
      console.log(error);
    }
  }

  const getCampaign = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const program = new anchor.Program(idl, programID, provider);
  
    const programAccounts = await connection.getProgramAccounts(programID);
  
    const campaigns = await Promise.all(
      programAccounts.map(async (campaign) => ({
        ...(await program.account.campaign.fetch(campaign.pubkey)),
        pubkey: campaign.pubkey,
      }))
    );
  
    setCampaigns(campaigns);
  };
  
  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);
      const campaignName = inputName;
      const campaignDesc = inputDesc;

      const [campaign] = await PublicKey.findProgramAddress(
        [utf8.encode('CampaignSeed'), provider.wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.create('campaignName', 'campaignDesc',{
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
    });
    console.log('Created a new Campaign w/ address: ', campaign.toString());
    } catch (error) {
      console.log('ERROR IN CREATING/INITIALIZING ACCOUNT', error);
    }
  }

  const donate = async (campaign) => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);
      const campaignDonation = inputDonation;

      await program.rpc.donate(new anchor.BN(inputDonation * anchor.web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log('DONATED TO: ', campaign.toString());
      getCampaign();
    } catch (error) {
      console.log('ERROR IN DONATING', error);
    }
  };

  const withdraw = async (campaign) => {
    try {
      const provider = getProvider();
      const program = new anchor.Program(idl, programID, provider);
  
      await program.rpc.withdraw(new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL), {   //modify the donation on how much they want to donate 
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
        },
      });
      console.log('DONATED TO: ', campaign.toString());
      getCampaign();
    } catch (error) {
      console.log('ERROR IN DONATING', error);
    }
  };
  
  const renderNotConnectedContainer = () => {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  };
  
  const onInputChange = (event) =>{
    const {inputName}= event.target;
    setInputName(inputName);
    const {inputDesc}= event.target;
    setInputDesc(inputDesc);
    const {inputDonation}= event.target;
    setInputDonation(inputDonation);
    
  }

  const renderConnectedContainer = () => {
    return (
      <>
        {/* <input placeholder="Campaign Name?" campaignName = {inputName} onChange={onInputChange}></input> */}
        {/* <input placeholder="Campaign Description?" campaignDesc = {inputDesc} onChange={onInputChange}></input> */}
        <button onClick={createCampaign}>Create Campaign</button>
        <button onClick={getCampaign}>Get Campaign Lists</button>
        <br />
        {campaigns.map((campaign) => (
          <>
            <p>Campaign ID: {campaign.pubkey.toString()}</p>
            <p>Balance: {(campaign.amountDonated / anchor.web3.LAMPORTS_PER_SOL).toString()}</p>
            <p>{campaign.name}</p>
            <p>{campaign.description}</p>
            <input placeholder="Donate Amount?" campaignDonation = {inputDonation} onChange={onInputChange}></input>
            <button onClick={() => donate(campaign.pubkey)}>Click to Donate</button>
            <button onClick={() => withdraw(campaign.pubkey)}>Click to Withdraw</button>
            <br />
          </>
        ))}
      </>
    );
  };
  
  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [])



  return (
    <div className="App">
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </div>
  );
}

export default App;