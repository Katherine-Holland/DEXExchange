const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Token", () => {

    it("has correct name", async () => {
        const Token = await ethers.getContractFactory("Token")
        const token = await Token.deploy()
        const name = await token.name()
        expect(name).to.equal("My Token")
    })

})
