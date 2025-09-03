#!/usr/bin/env node

/**
 * Create AI-OS CE Toolkit - Scaffold a new project
 * Usage: npx @ai-os/ce-toolkit create my-project
 */

const { program } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const prompts = require("prompts");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════╗
║                                               ║
║      🤖 AI-OS CE Toolkit 🚀                 ║
║                                               ║
║   Community Edition - AI dev toolkit         ║
║                                               ║
╚═══════════════════════════════════════════════╝
`;

program
  .name("create-ai-os-ce")
  .description("Create a new AI-OS CE project")
  .version("1.0.0")
  .argument("[project-name]", "Name of the project")
  .option("--typescript", "Use TypeScript (default)", true)
  .option("--javascript", "Use JavaScript")
  .option("--skip-install", "Skip installing dependencies")
  .option("--skip-git", "Skip git initialization")
  .option("--use-npm", "Use npm (default)")
  .option("--use-yarn", "Use Yarn")
  .option("--use-pnpm", "Use pnpm")
  .parse();

async function main() {
  console.log(chalk.cyan(banner));

  const options = program.opts();
  let projectName = program.args[0];

  // Interactive mode if no project name provided
  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "What is your project name?",
      initial: "my-ai-os-ce",
      validate: (value) => {
        if (!value) return "Project name is required";
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "Project name can only contain lowercase letters, numbers, and hyphens";
        }
        return true;
      },
    });

    if (!response.projectName) {
      console.log(chalk.red("✖ Project creation cancelled"));
      process.exit(1);
    }

    projectName = response.projectName;
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`✖ Directory ${projectName} already exists`));
    process.exit(1);
  }

  // Get configuration preferences
  const config = await prompts([
    {
      type: "select",
      name: "language",
      message: "Which language would you like to use?",
      choices: [
        { title: "TypeScript", value: "typescript", selected: true },
        { title: "JavaScript", value: "javascript" },
      ],
      initial: 0,
    },
    {
      type: "multiselect",
      name: "features",
      message: "Which features would you like to include?",
      choices: [
        { title: "GitHub Workflows", value: "github", selected: true },
        { title: "Agent Boot System", value: "agent", selected: true }
      ],
      hint: "- Space to select. Enter to submit",
    },
    {
      type: "select",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: [
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
      ],
      initial: 0,
    },
  ]);

  console.log("\n");
  const spinner = ora("Creating project structure...").start();

  try {
    // Create project directory
    fs.ensureDirSync(projectPath);

    // Copy template files
    const templatePath = path.join(__dirname, "..", "templates", config.language);
    const fallbackTemplate = path.join(__dirname, "..", "templates", "base");

    if (fs.existsSync(templatePath)) {
      fs.copySync(templatePath, projectPath);
    } else if (fs.existsSync(fallbackTemplate)) {
      fs.copySync(fallbackTemplate, projectPath);
    }

    // Copy selected features
    if (config.features.includes("github")) {
      spinner.text = "Adding GitHub workflows...";
      const githubPath = path.join(__dirname, "..", ".github");
      if (fs.existsSync(githubPath)) {
        fs.copySync(githubPath, path.join(projectPath, ".github"));
      }
    }

    if (config.features.includes("agent")) {
      spinner.text = "Adding Agent Boot system...";
      const agentPath = path.join(__dirname, "..", "agent_boot.py");
      if (fs.existsSync(agentPath)) {
        fs.copySync(agentPath, path.join(projectPath, "agent_boot.py"));
      }
    }



    // Create package.json
    spinner.text = "Creating package.json...";
    const packageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        lint: "eslint . --ext .ts,.tsx,.js,.jsx",
        "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
        format: "prettier --write .",
        agent: "python3 agent_boot.py",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      },
      devDependencies: {},
    };

    // Add TypeScript dependencies if selected
    if (config.language === "typescript") {
      packageJson.devDependencies["typescript"] = "^5.5.4";
      packageJson.devDependencies["@types/react"] = "^18.2.45";
      packageJson.devDependencies["@types/react-dom"] = "^18.2.18";
      packageJson.devDependencies["@types/node"] = "^20.11.30";
    }

    fs.writeJsonSync(path.join(projectPath, "package.json"), packageJson, {
      spaces: 2,
    });

    // Create essential files
    spinner.text = "Creating configuration files...";

    // README.md
    const readme = `# ${projectName}

Created with AI-OS CE Toolkit

## 🚀 Getting Started

\`\`\`bash
# Install dependencies
${config.packageManager} install

# Lint
${config.packageManager} run lint
\`\`\`

## 🤖 Agent Boot

\`\`\`bash
python3 agent_boot.py --help
\`\`\`

## 📚 Documentation

- [Contributing Guidelines](./CONTRIBUTING.md)
- [AI-OS CE Repository](https://github.com/MarcoPWx/AI-OS-CE)

## 📝 License

MIT
`;
    fs.writeFileSync(path.join(projectPath, "README.md"), readme);

    // .gitignore
    const gitignore = `node_modules
dist
.DS_Store
*.log
coverage
.env
.env.local
agent_boot.log
`;
    fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignore);

    spinner.succeed("Project structure created");

    // Initialize git
    if (!options.skipGit) {
      spinner.start("Initializing git repository...");
      execSync("git init", { cwd: projectPath, stdio: "ignore" });
      execSync("git add .", { cwd: projectPath, stdio: "ignore" });
execSync('git commit -m "Initial commit from AI-OS CE Toolkit"', {
        cwd: projectPath,
        stdio: "ignore",
      });
      spinner.succeed("Git repository initialized");
    }

    // Install dependencies
    if (!options.skipInstall) {
      spinner.start("Installing dependencies (this may take a few minutes)...");
      const installCmd = {
        npm: "npm install",
        yarn: "yarn",
        pnpm: "pnpm install",
      }[config.packageManager];

      execSync(installCmd, { cwd: projectPath, stdio: "ignore" });
      spinner.succeed("Dependencies installed");
    }

    // Success message
    console.log("\n" + chalk.green("✨ Project created successfully!"));
    console.log("\nNext steps:");
    console.log(chalk.cyan(`  cd ${projectName}`));

    if (options.skipInstall) {
      console.log(chalk.cyan(`  ${config.packageManager} install`));
    }

    console.log("\n" + chalk.gray("Happy coding! 🚀"));
  } catch (error) {
    spinner.fail("Project creation failed");
    console.error(chalk.red("Error:"), error.message);

    // Cleanup on failure
    if (fs.existsSync(projectPath)) {
      fs.removeSync(projectPath);
    }

    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
  process.exit(1);
});
