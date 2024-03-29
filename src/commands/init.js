const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const semver = require("semver");
const inquirer = require("inquirer");
const { writeManifest } = require("../utils/manifest");
const { generateAndWriteCompose } = require("../utils/compose");
const defaultAvatar = require("../assets/defaultAvatar");
const shell = require("../utils/shell");
const { releaseFiles } = require("../params");

const stringsToRemoveFromName = [
  "DAppNode-package-",
  "DAppNodePackage-",
  "DAppNode-Package",
  "DAppNodePackage"
];

// Manifest
const manifestPath = "dappnode_package.json";
const publicRepoDomain = "avado.dappnode.eth";
const defaultVersion = "0.0.1";

// Avatar
const avatarPath = "avatar.png";
const avatarData = defaultAvatar;

// Dockerfile
const dockerfilePath = path.join("build", "Dockerfile");
const dockerfileData = `FROM busybox

WORKDIR /usr/src/app

ENTRYPOINT echo "happy buidl $USERNAME!" && sleep 9999
`;

// .gitignore
const gitignorePath = ".gitignore";
const gitignoreCheck = "build_*";
const gitignoreData = `# DAppNodeSDK release directories
build_*
`;

/**
 * INIT
 *
 * Initialize the repository
 */

exports.command = "init";

exports.describe = "Initialize a new AVADO package in the current directory";

exports.builder = yargs =>
  yargs
    .option("y", {
      alias: "yes",
      description:
        "Answer yes or the default option to all initialization questions",
      type: "boolean"
    })
    .option("f", {
      alias: "force",
      description: "Overwrite previous project if necessary",
      type: "boolean"
    });

exports.handler = async ({ yes: useDefaults, force, dir }) => {
  // shell outputs tend to include trailing spaces and new lines
  const directoryName = await shell('echo "${PWD##*/}"', { silent: true });
  const defaultAuthor = await shell("whoami", { silent: true });
  const defaultName = getDnpName(directoryName);

  const defaultAnswers = {
    name: defaultName,
    version: defaultVersion,
    description: `${defaultName} description`,
    avatar: "",
    type: "service",
    author: defaultAuthor,
    license: "GLP-3.0"
  };

  if (!useDefaults) {
    console.log(`This utility will walk you through creating a dappnode_package.json file.
It only covers the most common items, and tries to guess sensible defaults.
`);
  }

  if (fs.existsSync(path.join(dir, manifestPath)) && !force) {
    const continueAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "continue",
        message:
          "This directory is already initialized. Are you sure you want to overwrite the existing manifest?"
      }
    ]);
    if (!continueAnswer.continue) {
      console.log("Stopping");
      process.exit(1);
    }
  }

  const answers = useDefaults
    ? defaultAnswers
    : await inquirer.prompt([
      {
        type: "input",
        name: "name",
        default: defaultAnswers.name,
        message: "AVADO package name"
      },
      {
        type: "input",
        name: "version",
        default: defaultAnswers.version,
        message: "Version",
        validate: val =>
          !semver.valid(val) ||
            !(
              semver.eq(val, "1.0.0") ||
              semver.eq(val, "0.1.0") ||
              semver.eq(val, "0.0.1")
            )
            ? "the version needs to be valid semver. If this is the first release, the version must be 1.0.0, 0.1.0 or 0.0.1 "
            : true
      },
      {
        type: "input",
        name: "description",
        message: "Description",
        default: defaultAnswers.description
      },
      {
        type: "input",
        message: "Author",
        name: "author",
        default: defaultAnswers.author
      },
      {
        type: "input",
        message: "License",
        name: "license",
        default: defaultAnswers.license
      }
    ]);

  // Construct DNP
  const manifest = {
    name: answers.name ? getDnpName(answers.name) : defaultName,
    version: answers.version || defaultVersion,
    description: answers.description,
    autoupdate: true,
    type: "service",
    avatar: "/ipfs/QmYRmFCtdXvqq3drc6kBXxeWiiMatTfKVpVrmLX883cQbR",
    author: answers.author,
    image: {
      "volumes": [
        "data:/data"
      ],
      "ports": [
        "12345:12345",
        "12345:12345/UDP"
      ],
      "environment": [
        "EXTRA_OPTS=",
        "MY_DOCKER_ENV_VAR="
      ]
    },
    links: {
      homepage: "https://your-project-homepage-or-docs.io"
    },
    license: answers.license
  };

  // Create folders
  await shell(`mkdir -p ${path.join(dir, "build")}`, { silent: true });

  // Write manifest and compose
  writeManifest({ manifest, dir });
  generateAndWriteCompose({
    manifest,
    dir
  });

  // Add default avatar so users can run the command right away
  const files = fs.readdirSync(dir);
  const avatarFile = files.find(file => releaseFiles.avatar.regex.test(file));
  if (!avatarFile) {
    fs.writeFileSync(
      path.join(dir, avatarPath),
      Buffer.from(avatarData, "base64")
    );
  }

  // Initialize Dockerfile
  fs.writeFileSync(path.join(dir, dockerfilePath), dockerfileData);

  // Initialize .gitignore
  writeGitIgnore(path.join(dir, gitignorePath));

  console.log(`
${chalk.green("Your AVADO package is ready")}: ${manifest.name}

To start, you can:

 - Develop your dockerized app in   ./build
 - Add settings in the compose at   ./docker-compose.yml
 - Add metadata in the manifest at  ./dappnode_package.json

 - Test your docker locally using "docker-compose up"

Make sure to replace the example ports and environment variables with 
your ports and environment variables - or remove them if you don't need them.

Once ready, you can build, install, and test it on your AVADO by running

  avadosdk build 
`);
};

/**
 * Parses a directory or generic package name and returns a full ENS guessed name
 * @param {string} name "AVADOpackage-vipnode"
 * @return {string} "vipnode.public.dappnode.eth"
 */
function getDnpName(name) {
  // Remove prepended strings if any
  for (const stringToRemove of stringsToRemoveFromName) {
    name = name.replace(stringToRemove, "");
  }

  // Make name lowercase
  name = name.toLowerCase();

  // Append public domain
  return name.endsWith(".eth") ? name : `${name}.${publicRepoDomain}`;
}

/**
 * Make sure there's a gitignore for the builds or create it
 */
function writeGitIgnore(filepath) {
  if (fs.existsSync(filepath)) {
    const currentGitignore = fs.readFileSync(filepath, "utf8");
    if (!currentGitignore.includes(gitignoreCheck))
      fs.writeFileSync(filepath, currentGitignore + gitignoreData);
  } else {
    fs.writeFileSync(filepath, gitignoreData);
  }
}
