/**
 * FlowScheduler Contract Deployment Information for Scroll Sepolia and Base Sepolia
 * Generated from deployment broadcast data
 */

export const FLOW_SCHEDULER_DEPLOYMENT = {
    // Network Information
    chainId: 534351, // scroll Sepolia
    network: 'scroll-sepolia',

    // Contract Addresses
    addresses: {
        flowScheduler: '0x10Df6bEFd8d606b6f4E51911D0437A1CD94F32B0',
        flowSchedulerResolver: '0x790501E0B66ebE68A38270a43e69145607a05c4b',
        superfluidHost: '0x42b05a6016B9eED232E13fd56a8F0725693DBF8e'
    },
};

export const FLOW_SCHEDULER_DEPLOYMENT_BASE_SEPOLIA = {
    // Network Information
    chainId: 84532, // base Sepolia
    network: 'base-sepolia',

    // Contract Addresses
    addresses: {
        flowScheduler: '0x721c16F0659d048a3568b0A929Cd0e96bD94cDae', 
        flowSchedulerResolver: '0x3eC5a2a348eE2f5a94015c5c7eAf8ABCe5424B0C', 
        superfluidHost: '0x109412E3C84f0539b43d39dB691B08c90f58dC7c'
    },
};

// FlowScheduler Contract ABI
export const FLOW_SCHEDULER_ABI = [
    // Constructor
    {
        "inputs": [
            {
                "internalType": "contract ISuperfluid",
                "name": "host",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },

    // State Variables
    {
        "inputs": [],
        "name": "HOST",
        "outputs": [
            {
                "internalType": "contract ISuperfluid",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "flowSchedules",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startMaxDelay",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "startAmount",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "userData",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    // Main Functions
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startMaxDelay",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "startAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "createFlowSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "ctx",
                "type": "bytes"
            }
        ],
        "name": "deleteFlowSchedule",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "newCtx",
                "type": "bytes"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            }
        ],
        "name": "executeCreateFlow",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            }
        ],
        "name": "executeDeleteFlow",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [
            {
                "internalType": "address",
                "name": "superToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "getFlowSchedule",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint32",
                        "name": "startDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "startMaxDelay",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "endDate",
                        "type": "uint32"
                    },
                    {
                        "internalType": "int96",
                        "name": "flowRate",
                        "type": "int96"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "userData",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct IFlowScheduler.FlowSchedule",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    // Events
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startMaxDelay",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "uint256",
                "name": "startAmount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            }
        ],
        "name": "FlowScheduleCreated",
        "type": "event"
    },

    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "name": "FlowScheduleDeleted",
        "type": "event"
    },

    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "startDate",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "startMaxDelay",
                "type": "uint32"
            },
            {
                "internalType": "int96",
                "name": "flowRate",
                "type": "int96"
            },
            {
                "internalType": "uint256",
                "name": "startAmount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            }
        ],
        "name": "CreateFlowExecuted",
        "type": "event"
    },

    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "contract ISuperToken",
                "name": "superToken",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "uint32",
                "name": "endDate",
                "type": "uint32"
            },
            {
                "internalType": "bytes",
                "name": "userData",
                "type": "bytes"
            }
        ],
        "name": "DeleteFlowExecuted",
        "type": "event"
    }
];

// Common SuperToken addresses on Base Sepolia (you'll need to update these with actual addresses)
export const SUPER_TOKENS = {
    // Add actual SuperToken addresses for Base Sepolia
    // Example: ETHx, USDCx, DAIx, etc.
    // ETHx: '0x...',
    // USDCx: '0x...',
    // DAIx: '0x...'
};

