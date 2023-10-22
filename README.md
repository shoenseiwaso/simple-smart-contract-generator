# Simple Smart Contract Generator

Easily generate Solidity smart contracts with customizable token properties. Tailored for ERC-20 tokens, this tool provides options for mintable and burnable functionalities. It also automatically generates test code. It works entirely on the frontend.

To run the generated test code, you will need to setup a Hardhat project and paste the generated smart contract code and test code in. Something like:

1. Install [Hardhat](https://hardhat.org/)
2. Run:

```
npx hardhat
```

And follow the prompts.

## Running the project

1. Clone this repo
2. Change to the web folder: `cd www`
3. Launch a simple web server. For example:
```
$ python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
4. Open a browser to http://localhost:8000

## CAUTION!

THIS PROJECT IS FOR ILLUSTRATIVE PURPOSES ONLY AND THE GENERATED CODE IS UNAUDITED AND SHOULD NOT BE USED IN PRODUCTION!