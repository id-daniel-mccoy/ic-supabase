import React, { useEffect, useState } from "react"
import { HttpAgent, Actor } from "@dfinity/agent";
import { ICWalletList } from "./ICWalletList";
import { UserObject } from "./functions";
import { AssetManager } from "@dfinity/assets";
import { Principal } from "@dfinity/principal";
import "./index.css";
import * as cycles from "./interfaces/cmc/cmc";
import * as ledger from "./interfaces/ledger/index";
import * as distro from "./interfaces/distro/index";

export function Parent() {

  const [currentUser, setCurrentUser] = useState<UserObject | null>(null);

  // This function is passed to the ICWalletList component to handle the user auth process.
  const giveToParent = (principal: string, agent: HttpAgent, provider: string) => {
    setCurrentUser({principal, agent, provider});
  }

  // This creates an instance of the asset canister actor.
  const createAssetActor = async() : Promise<AssetManager> => {
    const assetActor = new AssetManager({agent: currentUser!.agent as HttpAgent, canisterId: "zks6t-giaaa-aaaap-qb7fa-cai"});
    return assetActor;
  }

  const deleteAsset = async(key: string) => {
    const actor = await createAssetActor();
    const response = await actor.delete(key);
    alert(response);
  }

  // This lists the available files in the asset canister.
  const loadList = async() => {
    const actor = await createAssetActor();
    const list = await actor.list();
    const stuff = document.getElementById("stuff");
    if (stuff) {
      const listDiv = document.createElement("div");
      listDiv.style.display = "flex";
      listDiv.style.flexDirection = "column";
      listDiv.style.alignItems = "center";
      listDiv.style.justifyContent = "center";
      list.forEach((file) => {
        const name = document.createElement("img");
        const header = "https://zks6t-giaaa-aaaap-qb7fa-cai.raw.icp0.io/";
        // if file key starts with a slash just remove it
        if (file.key.startsWith("/")) {
          name.src = header + file.key.slice(1);
        } else {
          name.src = header + file.key;
        }
        name.style.width = "100px";
        name.style.height = "100px";
        name.style.margin = "10px";
        name.style.borderRadius = "10px";
        name.onclick = async() => {
          const rootDiv = document.getElementById("options");
          if (rootDiv) {
            rootDiv.innerHTML = "";
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.backgroundColor = "red";
            deleteButton.style.color = "white";
            deleteButton.style.padding = "10px";
            deleteButton.style.border = "none";
            deleteButton.style.borderRadius = "10px";
            deleteButton.style.margin = "10px";
            deleteButton.style.cursor = "pointer";
            deleteButton.onclick = async() => {
              await deleteAsset(file.key);
              rootDiv.innerHTML = "";
              await loadList();
            }
            rootDiv.appendChild(deleteButton);
          }
        }
        
        listDiv.appendChild(name);
      }
      )
      stuff.appendChild(listDiv);
    }
  }

  // This function creates a temporary file upload interface.
  // Todo: Needs styling and error handling.
  const createFileUploadInterface = async() => {
    const rootDiv = document.getElementById("overlay");
    const container = document.createElement("div");
    container.className = "centerContainer";
    rootDiv?.appendChild(container);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    container.appendChild(fileInput);

    const fileButton = document.createElement("button");
    fileButton.textContent = "Select File";
    fileButton.style.backgroundColor = "blue";
    fileButton.style.color = "white";
    fileButton.style.padding = "10px";
    fileButton.style.border = "none";
    fileButton.style.borderRadius = "10px";
    fileButton.style.margin = "10px";
    fileButton.style.cursor = "pointer";
    fileButton.onclick = () => {
      fileInput.click();
    }
    container.appendChild(fileButton);
    
    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.backgroundColor = "green";
    submitButton.style.color = "white";
    submitButton.style.padding = "10px";
    submitButton.style.border = "none";
    submitButton.style.borderRadius = "10px";
    submitButton.style.margin = "10px";
    submitButton.style.cursor = "pointer";
    submitButton.onclick = async() => {
      const actor = await createAssetActor();
      const file = fileInput.files![0];
      const response = await actor.store(file);
      alert(response);
      container.remove();
      await loadList();
    }
    container.appendChild(submitButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.backgroundColor = "red";
    cancelButton.style.color = "white";
    cancelButton.style.padding = "10px";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "10px";
    cancelButton.style.margin = "10px";
    cancelButton.style.cursor = "pointer";
    cancelButton.onclick = () => {
      container.remove();
    }
    container.appendChild(cancelButton);
  }

  const whitelist: Array<string> = ["zks6t-giaaa-aaaap-qb7fa-cai", "jeb4e-myaaa-aaaak-aflga-cai"];

  const uploadFile = async() => {
    await createFileUploadInterface();
  }

  const createActors = async() => {
    const cyclesActor = Actor.createActor(cycles.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "rkp4c-7iaaa-aaaaa-aaaca-cai"
    });
    const ledgerActor = Actor.createActor(ledger.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai"
    });
    const distroActor = Actor.createActor(distro.idlFactory, {
      agent: currentUser!.agent as HttpAgent,
      canisterId: "jeb4e-myaaa-aaaak-aflga-cai"
    });
    return {
      cycles: cyclesActor,
      ledger: ledgerActor,
      distro: distroActor
    }
  }

  const verifyTransaction = async(block_height: number, amount_sent: number, actor: any) => {
    const basicAgent = new HttpAgent({host: "https://ic0.app",});
    const ledgerActor = actor;
    const result : any = await ledgerActor.query_blocks({start: block_height, length: 1});
    console.log("The result of the query is: ", result);
    const transferInfo = result!.blocks[0].transaction.operation[0].Transfer;
    console.log("The transfer info is: ", transferInfo);
    const transferredFrom = Principal.fromUint8Array(transferInfo.from).toText();
    const transferredTo = Principal.fromUint8Array(transferInfo.to).toText();
    const transferredAmount = Number(transferInfo.amount.e8s);
    console.log("The transferred amount is: ", transferredAmount);
    if (transferredAmount === amount_sent) {
        return true;
    } else {
        return false;
    }
  }

  const cyclesTopUp = async() => {
    const actors = await createActors();
    console.log("Converting rate...");
    const conversionRate: any = await actors.cycles.get_icp_xdr_conversion_rate();
    const actualRate = conversionRate.data.xdr_permyriad_per_icp.toString();
    const requiredZeros = "00000000";
    const finalRate = Number(actualRate + requiredZeros);
    // Amount of ICP requested from the user.
    const amountOfICP = 0.01;
    const amountInXDR = amountOfICP * finalRate;
    console.log("The amount in XDR is: ", amountInXDR);

    console.log("Handling plug payment...");
    // Note: Change to your Plug Address.
    const to = "7zdi6-6h2gk-g4j54-cigti-iiu4u-lj4vy-bewjf-oouoc-dnlck-fyfy5-aae";
    const amount = amountOfICP * 100000000;
    console.log(amount);
    const memo = "Testing";
    const result = await (window as any).ic.plug.requestTransfer({ to, amount, memo });
    console.log("The result of the transfer is: ", result);
    console.log("Verifying the transaction...");
    const verified = await verifyTransaction(result.height, amount, actors.ledger);
    if (verified) {
        console.log("The transaction was verified!");
    } else {
        console.log("The transaction was not verified!");
        return;
    }

    console.log("Checking current balances...");
    console.log(actors.distro);
    const balances = await actors.distro.getBalances();
    console.log("The current balances of the canisters are: ", balances);
    const topupResult = await actors.distro.addCyclesToAll(amountInXDR);
    console.log("The new balances of the canisters are: ", topupResult);
  }

  useEffect(() => {
    if (currentUser) {
      loadList();
    }
  } , [currentUser]);
 
  return (
    <div className="app">
      {!currentUser && 
      <ICWalletList giveToParent={giveToParent} whitelist={whitelist} />
      }
      {
        currentUser && 
        <div className="overlay" id="overlay">
          <button onClick={uploadFile} >File Upload</button>
          <div id="inventory" className="inventory"></div>
          <div id='options' className="options"></div>
          <div style={{marginBottom: "10px"}} />

          <button onClick={cyclesTopUp} >Donate Cycles</button>
        </div>
      }
    </div>
  )
}