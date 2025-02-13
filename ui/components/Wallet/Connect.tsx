import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { FC } from "react";
import { FaWallet } from 'react-icons/fa';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { CoinbaseWallet, MetamaskIcon, WalletConnectIcon } from "../Icons";


const WalletIcon: FC<{name: string}> = ({name}) => {
  const walletName = name.toLowerCase();
  return <>
    {
      walletName === 'metamasksdk' ? 
       <MetamaskIcon /> :
       walletName === 'coinbasewalletsdk' ?
       <CoinbaseWallet /> :
       walletName === 'walletconnect' ?
       <WalletConnectIcon /> :
       <FaWallet size={28}/>
    }
  </>
}

export const ConnectButton: FC = () => {
  const {connectors, connect, status, error } = useConnect();
  const {isConnected, chain, address, connector} = useAccount();
  const {disconnect} = useDisconnect();
  const {chains, switchChain} = useSwitchChain();


  console.log(`chainId: ${chain} - (${isConnected})`);
  console.log(address);
  console.log(connector);

  return (
    <Dropdown >
      <DropdownTrigger>
        <Button color="primary" className={`uppercase ${isConnected ? 'hidden' : ''}`} variant="solid">
          Connect
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions">
        <DropdownSection title='Wallets'>
          {connectors.map((connector) => (
            <DropdownItem 
              key={connector.id} 
              onPress={() => connect({connector})}
              startContent={<WalletIcon name={connector.id}/>}
              >
                {connector.name}
            </DropdownItem>
          ))}
        </DropdownSection>

        <DropdownSection title='Wallets'>
          {connectors.map((connector) => (
            <DropdownItem 
              key={connector.id} 
              onPress={() => connect({connector})}
              startContent={<WalletIcon name={connector.id}/>}
              >
                {connector.name}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="Session" className={!isConnected ? 'hidden': ''}>
          <DropdownItem 
            key="disconnect" 
            as={Button} 
            color="danger" 
            title="Disconnect" 
            onPress={() => disconnect()} 
            /> 
        </DropdownSection>        
      </DropdownMenu>
    </Dropdown>
  );
};
