const { ethers } = require("hardhat")


async function deployExchangeFixture() {
    const Exchange = await ethers.getContractFactory("Exchange")
    const Token = await ethers.getContractFactory("Token")

    const token0 = await Token.deploy("Dapp University", "DAPP", "1000000")
    const token1 = await Token.deploy("Mock Dai", "mDAI", "1000000")

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const feeAccount = accounts[1]
    const user1 = accounts[2]
    const user2 = accounts[3]

    const AMOUNT = ethers.parseUnits("100", 18)

    //Transfer 100 token0 to user 1
    await (await token0.connect(deployer).transfer(user1.address, AMOUNT)).wait()

    //Transfer 100 token0 to user 2
    await (await token1.connect(deployer).transfer(user2.address, AMOUNT)).wait()

    const FEE_PERCENT = 10
    const exchange = await Exchange.deploy(feeAccount, FEE_PERCENT)

    return { tokens: {token0, token1 }, exchange, accounts: { deployer, feeAccount, user1, user2 } }
}

async function depositExchangeFixture() {
    const { tokens, exchange, accounts } = await deployExchangeFixture()
    const AMOUNT = ethers.parseUnits("100", 18)

    //Transfer 100 token0 to user 1
    await (await tokens.token0.connect(accounts.user1).approve(await exchange.getAddress(), AMOUNT)).wait()

    //Deposit token0 for user 1
    const transaction = await exchange.connect(accounts.user1).depositToken(await tokens.token0.getAddress(), AMOUNT)
    await transaction.wait()

    //Approvde and deposit token1 for user2
    await (await tokens.token1.connect(accounts.user2).approve(await exchange.getAddress(), AMOUNT)).wait()
    await (await exchange.connect(accounts.user2).depositToken(await tokens.token1.getAddress(), AMOUNT)).wait()

    return { tokens, exchange, accounts, transaction }
}

async function orderExchangeFixture() {
    const { tokens, exchange, accounts } = await depositExchangeFixture()
    const AMOUNT = ethers.parseUnits("1", 18)  
    
    const transaction = await exchange.connect(accounts.user1).makeOrder(
        await tokens.token1.getAddress(),
        AMOUNT,
        await tokens.token0.getAddress(),
        AMOUNT
    )

    await transaction.wait()
    return { tokens, exchange, accounts, transaction }
}

module.exports = {
    deployExchangeFixture,
    depositExchangeFixture,
    orderExchangeFixture
}