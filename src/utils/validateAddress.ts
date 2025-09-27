import { ethers } from "ethers";

export const validateAddress = (address: string) => {
    if (!address) {
        return 'Address is required';
    }
    if (!ethers.utils.isAddress(address)) {
        return 'Invalid Ethereum address';
    }
    return '';
};