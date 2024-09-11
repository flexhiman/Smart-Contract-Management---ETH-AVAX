# Metacrafters ETH ATM

This project is a DApp that interacts with a solidity smart contract to function as an ATM. Users can deposit and withdraw ETH, view their balance, transaction count, and transaction history. The ATM also includes dark/light mode switching and is fully responsive.

## Features

- The DApp interacts with the solidity smart contract to function as an ATM.
- User can view his/her ETH balance.
- The user can track the number of transactions made.
- User can switch between dark and light modes.
- Works on all screen sizes.
- The user gets a notification on every successful or failed transaction.

  ## Set-up

  Clone the GitHub from the Metacrafter modules.
  Inside the project directory, in the terminal type: npm i
   ```bash
  npm i
  ```
  Open two additional terminals in your VS code
  In the second terminal type: npx hardhat node
   ```bash
  npx hardhat
   ```
  In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
   ```bash
  npx hardhat run scripts/deploy.js --network localhost
  ```
  In the first terminal, type npm run dev to launch the front-end.
  ```bash
  npm run dev
  ```
