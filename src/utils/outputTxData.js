const fs = require("fs");
const chalk = require("chalk");
const getTxDataAdminUiLink = require("./getTxDataAdminUiLink");

function outputTxData({ txData, toConsole, toFile }) {
  const adminUiLink = getTxDataAdminUiLink({ txData });

  const txDataToPrint = {
    To: txData.to,
    Value: txData.value,
    Data: txData.data,
    "Gas limit": txData.gasLimit
  };

  const txDataString = Object.keys(txDataToPrint)
    .map(key => `${key}: ${txDataToPrint[key]}`)
    .join("\n");

  // If requested output txDataToPrint to file
  if (toFile) {
    fs.writeFileSync(
      toFile,
      `
${txDataString}

You can execute this transaction with Metamask by following this pre-filled link

${adminUiLink}

`
    );
  }

  const txDataStringColored = Object.keys(txDataToPrint)
    .map(key => `  ${chalk.green(key)}: ${txDataToPrint[key]}`)
    .join("\n");

  // If requested output txDataToPrint to console
  if (toConsole) {
    console.log(`
${chalk.green("Transaction successfully generated.")}
You must execute this transaction in mainnet to publish a new version of this DNP
To be able to update this repository you must be the authorized dev.

${chalk.gray("###########################")} TX data ${chalk.gray(
      "#############################################"
    )}

${txDataStringColored}

${chalk.gray(
  "#################################################################################"
)}

  You can execute this transaction with Metamask by following this pre-filled link

  ${adminUiLink}

${chalk.gray(
  "#################################################################################"
)}
`);
  }
}

module.exports = outputTxData;
