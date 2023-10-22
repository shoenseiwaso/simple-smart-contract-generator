function generateContract() {
    let tokenName = document.getElementById('tokenName').value;
    let tokenSymbol = document.getElementById('tokenSymbol').value;
    let contractType = document.querySelector('input[name="contractType"]:checked').value;

    let baseContract = `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @notice ${tokenName} is an ERC20 token contract. THIS IS FOR ILLUSTRATIVE PURPOSES ONLY AND THIS CODE IS UNAUDITED!

contract Token${tokenName} {

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    string public constant name = "${tokenName}";
    string public constant symbol = "${tokenSymbol}";
    uint8 public constant decimals = 18;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Transfer from the zero address");
        require(recipient != address(0), "Transfer to the zero address");
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "Approve from the zero address");
        require(spender != address(0), "Approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
`;

    if(contractType === "mintable") {
        baseContract += `
    function mint(address account, uint256 amount) public {
        require(account != address(0), "Mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
`;
    } else if(contractType === "burnable") {
        baseContract += `
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from the zero address");
        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
`;
    }

    baseContract += `}`;

    document.getElementById('contractCode').value = baseContract;

    // Generate corresponding test code:
    let testCode = generateTestCode(tokenName, tokenSymbol, contractType);
    document.getElementById('testCode').value = testCode;
}

function generateTestCode(tokenName, tokenSymbol, contractType) {
    let baseTestCode = `const ${tokenName} = artifacts.require('${tokenName}');
    
contract('${tokenName} tests', (accounts) => {
    let instance;

    beforeEach(async () => {
        instance = await ${tokenName}.new();
    });

    it('should initialize with the correct name, symbol, decimals, and total supply', async () => {
        const name = await instance.name();
        const symbol = await instance.symbol();
        const decimals = await instance.decimals();
        const totalSupply = await instance.totalSupply();

        assert.equal(name, "${tokenName}");
        assert.equal(symbol, "${tokenSymbol}");
        assert.equal(decimals, 18);  // Assuming a fixed decimals value for this example
        assert.equal(totalSupply, 0); // Assuming the initial total supply is 0
    });

    it('should transfer tokens correctly', async () => {
        await instance.mint(accounts[0], 1000);
        await instance.transfer(accounts[1], 500, { from: accounts[0] });
        const balance = await instance.balanceOf(accounts[1]);
        assert.equal(balance, 500);
    });

    it('should fail when trying to transfer more tokens than available', async () => {
        let errorOccurred = false;
        try {
            await instance.transfer(accounts[1], 2000, { from: accounts[0] });
        } catch (error) {
            errorOccurred = true;
        }
        assert.equal(errorOccurred, true);
    });

    it('should handle approvals correctly', async () => {
        await instance.approve(accounts[1], 300, { from: accounts[0] });
        const allowance = await instance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance, 300);
    });

    it('should handle transferFrom correctly', async () => {
        await instance.mint(accounts[0], 1000);
        await instance.approve(accounts[1], 300, { from: accounts[0] });
        await instance.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
        const balance = await instance.balanceOf(accounts[2]);
        assert.equal(balance, 200);
    });

    it('should fail transferFrom when trying to transfer more than allowance', async () => {
        await instance.mint(accounts[0], 1000);
        await instance.approve(accounts[1], 300, { from: accounts[0] });
        let errorOccurred = false;
        try {
            await instance.transferFrom(accounts[0], accounts[2], 400, { from: accounts[1] });
        } catch (error) {
            errorOccurred = true;
        }
        assert.equal(errorOccurred, true);
    });
`;
    
        if(contractType === "mintable") {
            baseTestCode += `
    it('should mint tokens correctly', async () => {
        await instance.mint(accounts[0], 1000);
        const balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, 1000);
    });

    it('should fail if non-minters try to mint tokens', async () => {
        let errorOccurred = false;
        try {
            await instance.mint(accounts[0], 1000, { from: accounts[1] }); // Assuming only the contract owner (default account[0]) can mint in our contract design
        } catch (error) {
            errorOccurred = true;
        }
        assert.equal(errorOccurred, true);
    });
`;
        }
    
        if(contractType === "burnable") {
            baseTestCode += `
    it('should burn tokens correctly', async () => {
        await instance.mint(accounts[0], 1000);
        await instance.burn(500, { from: accounts[0] });
        const balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance, 500);
    });

    it('should fail if trying to burn more tokens than held', async () => {
        await instance.mint(accounts[0], 1000);
        let errorOccurred = false;
        try {
            await instance.burn(1500, { from: accounts[0] });
        } catch (error) {
            errorOccurred = true;
        }
        assert.equal(errorOccurred, true, "Should have thrown an error when burning more than the balance");
    });
`;
    }

    baseTestCode += "});";

    return baseTestCode;
}
