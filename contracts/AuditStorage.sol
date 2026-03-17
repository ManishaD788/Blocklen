// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditStorage {
    struct AuditRecord {
        address auditor;
        string contractAddressOrName;
        string auditHash; 
        uint256 timestamp;
    }

    AuditRecord[] public audits;
    mapping(string => bool) public isAudited;

    event AuditStored(address indexed auditor, string contractAddressOrName, string auditHash, uint256 timestamp);

    function storeAudit(string memory _contractName, string memory _auditHash) public {
        audits.push(AuditRecord({
            auditor: msg.sender,
            contractAddressOrName: _contractName,
            auditHash: _auditHash,
            timestamp: block.timestamp
        }));
        isAudited[_contractName] = true;
        
        emit AuditStored(msg.sender, _contractName, _auditHash, block.timestamp);
    }

    function getAuditsCount() public view returns (uint256) {
        return audits.length;
    }
}
