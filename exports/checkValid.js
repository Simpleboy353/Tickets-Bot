const { ownerID, token, dburl } = require("../config.json")

function checkValid() {
    if (!ownerID) {
        throw ReferenceError("[OWNER_ID_MISSING] Couldn't find the Owner ID")
    }
    if (!token) {
        throw ReferenceError("[BOT_TOKEN_MISSING] Couldn't find the Bot Token")
    }
    if (!dburl) {
        throw ReferenceError("[CONNECTION_URL_MISSING] Couldn't find the MongoDB Connection URL")
    }
}

module.exports = {
    checkValid,
}