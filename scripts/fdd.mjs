#!/usr/bin/env node
// FDD harness helper: setup, doctor, skills/MCP listing and progress status.
// Reads its configuration from the "fdd" block of package.json so there is a single source of truth.
import { readFileSync, existsSync, readdirSync, cpSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = readJson(resolve(ROOT, "package.json"));
const fdd = pkg.fdd;

const COMMANDS = {
  setup: runSetup,
  skills: installExternalSkills,
  doctor: runDoctor,
  "list-skills": listSkills,
  "list-mcp": listMcp,
  status: showStatus,
  "merge-scaffold": mergeScaffold,
};

const AGENT_DIRS = { "claude-code": ".claude", "kiro-cli": ".kiro" };

const command = process.argv[2] ?? "doctor";
if (!COMMANDS[command]) {
  console.error(`Unknown command "${command}". Expected one of: ${Object.keys(COMMANDS).join(", ")}.`);
  process.exit(1);
}
await COMMANDS[command]();

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function run(cmd, args, { quiet = false } = {}) {
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: quiet ? "pipe" : "inherit", encoding: "utf8" });
  return { ok: result.status === 0, out: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim() };
}

function has(cmd) {
  return run("sh", ["-c", `command -v ${cmd}`], { quiet: true }).ok;
}

async function runSetup() {
  console.log("== FDD setup ==");
  installExternalSkills();
  console.log("\n-> Installing the Playwright browser used by playwright-cli");
  run("npx", ["--yes", "playwright-cli", "install-browser"]);
  console.log("\nSetup finished. Run `npm run doctor` to validate the environment.");
}

function installExternalSkills() {
  const external = Object.entries(fdd.skills.external);
  for (const [name, spec] of external) {
    const agents = spec.agents ?? ["claude-code"];
    const missing = agents.filter((agent) => !existsSync(resolve(ROOT, AGENT_DIRS[agent] ?? ".claude", "skills", name, "SKILL.md")));
    if (missing.length === 0) {
      console.log(`✓ skill ${name} already installed for ${agents.join(", ")}`);
      continue;
    }
    console.log(`-> installing skill ${name} from ${spec.source} for ${missing.join(", ")}`);
    const agentFlags = missing.flatMap((agent) => ["--agent", agent]);
    const { ok } = run("npx", ["--yes", "skills", "add", spec.source, "--skill", spec.skill, ...agentFlags, "--yes"]);
    if (!ok && spec.required) console.error(`✗ required skill ${name} failed to install. Retry manually: npx skills add ${spec.source} --skill ${spec.skill} ${agentFlags.join(" ")}`);
  }
}

function runDoctor() {
  console.log("== FDD doctor ==\n");
  const checks = [
    ["node >= 20", Number(process.versions.node.split(".")[0]) >= 20],
    ["git", has("git")],
    ["gh CLI", has("gh")],
    ["gh authenticated", has("gh") && run("gh", ["auth", "status"], { quiet: true }).ok],
    ["docker (needed when DB is enabled)", has("docker")],
    ["tmux (only for wave mode)", has("tmux")],
    ["playwright-cli", has("playwright-cli") || run("npx", ["--no-install", "playwright-cli", "--version"], { quiet: true }).ok],
    [".mcp.json present", existsSync(resolve(ROOT, ".mcp.json"))],
    ["AGENTS.md placeholders filled", !readFileSync(resolve(ROOT, "AGENTS.md"), "utf8").includes("<project-name>")],
    ["docs/context/ present", existsSync(resolve(ROOT, fdd.docs.context))],
    ["PRD generated (docs/PRD.md)", existsSync(resolve(ROOT, fdd.docs.prd))],
  ];
  for (const [skill, spec] of Object.entries({ ...fdd.skills.local, ...fdd.skills.external })) {
    const path = spec.path ?? `.claude/skills/${skill}`;
    checks.push([`skill ${skill} (claude)`, existsSync(resolve(ROOT, path, "SKILL.md"))]);
    checks.push([`skill ${skill} (kiro)`, existsSync(resolve(ROOT, ".kiro/skills", skill, "SKILL.md"))]);
  }
  checks.push([".kiro in sync with .claude (npm run kiro:sync)", run("node", ["scripts/kiro-sync.mjs", "--check"], { quiet: true }).ok]);
  checks.push([".kiro/settings/mcp.json present", existsSync(resolve(ROOT, ".kiro/settings/mcp.json"))]);
  checks.push(["kiro-cli (optional, Kiro headless/wave)", has("kiro-cli")]);
  for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(`\n${failed === 0 ? "All checks passed." : `${failed} check(s) need attention — see docs/guides/02-installation.md.`}`);
}

function listSkills() {
  console.log("Local skills (versioned in .claude/skills):");
  for (const [name, s] of Object.entries(fdd.skills.local)) console.log(`  ${s.stage.padEnd(14)} ${name.padEnd(28)} ${s.purpose}`);
  console.log("\nExternal skills (installed by `npm run skills:install`):");
  for (const [name, s] of Object.entries(fdd.skills.external)) console.log(`  ${(s.required ? "required" : "optional").padEnd(14)} ${name.padEnd(28)} ${s.source} — ${s.purpose}`);
}

function listMcp() {
  for (const tier of ["required", "recommended", "optional"]) {
    console.log(`${tier.toUpperCase()}:`);
    for (const [name, s] of Object.entries(fdd.mcp[tier] ?? {})) {
      console.log(`  ${name.padEnd(12)} ${s.purpose}`);
      if (s.install) console.log(`  ${"".padEnd(12)} install: ${s.install}`);
    }
  }
}

// Copies a clean-arch scaffold generated in a separate folder into this repo without
// overwriting harness files, then merges the scaffold's package.json into ours.
function mergeScaffold() {
  const source = process.argv[3];
  if (!source || !existsSync(resolve(source, "package.json"))) {
    console.error(`Usage: node scripts/fdd.mjs merge-scaffold <scaffold-dir>. Got "${source}", expected a folder containing package.json.`);
    process.exit(1);
  }
  const keep = new Set(["package.json", "AGENTS.md", "CLAUDE.md", "README.md", ".gitignore", ".git"]);
  for (const entry of readdirSync(source)) {
    if (keep.has(entry)) continue;
    cpSync(resolve(source, entry), resolve(ROOT, entry), { recursive: true, force: false, errorOnExist: false });
    console.log(`✓ copied ${entry}`);
  }
  const scaffoldPkg = readJson(resolve(source, "package.json"));
  const merged = { ...pkg };
  merged.workspaces = [...new Set([...(pkg.workspaces ?? []), ...(scaffoldPkg.workspaces ?? [])])];
  merged.scripts = { ...scaffoldPkg.scripts, ...pkg.scripts };
  merged.overrides = { ...(scaffoldPkg.overrides ?? {}), ...(pkg.overrides ?? {}) };
  merged.devDependencies = { ...(scaffoldPkg.devDependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  merged.dependencies = { ...(scaffoldPkg.dependencies ?? {}), ...(pkg.dependencies ?? {}) };
  for (const key of ["overrides", "devDependencies", "dependencies"]) if (Object.keys(merged[key]).length === 0) delete merged[key];
  writeFileSync(resolve(ROOT, "package.json"), `${JSON.stringify(merged, null, 2)}\n`);
  appendScaffoldIgnores(resolve(source, ".gitignore"));
  console.log("✓ package.json merged (workspaces, scripts, overrides, dependencies). Run `npm install` next.");
}

function appendScaffoldIgnores(path) {
  if (!existsSync(path)) return;
  const current = readFileSync(resolve(ROOT, ".gitignore"), "utf8").split("\n");
  const missing = readFileSync(path, "utf8").split("\n").filter((line) => line.trim() && !current.includes(line));
  if (missing.length === 0) return;
  writeFileSync(resolve(ROOT, ".gitignore"), `${current.join("\n").trimEnd()}\n\n# from clean-arch scaffold\n${missing.join("\n")}\n`);
  console.log(`✓ .gitignore: added ${missing.length} entr${missing.length === 1 ? "y" : "ies"}`);
}

function showStatus() {
  const path = resolve(ROOT, fdd.docs.progress);
  if (!existsSync(path)) {
    console.log(`No ${fdd.docs.progress} yet. Start with the prd-writer skill.`);
    return;
  }
  const progress = readJson(path);
  const features = Object.entries(progress.features).filter(([, f]) => f.status !== "removed");
  const byWave = new Map();
  for (const entry of features) byWave.set(entry[1].wave, [...(byWave.get(entry[1].wave) ?? []), entry]);
  for (const wave of [...byWave.keys()].sort((a, b) => a - b)) {
    console.log(`\nWave ${wave}`);
    for (const [id, f] of byWave.get(wave)) {
      const deps = f.dependencies.length ? f.dependencies.join(",") : "—";
      console.log(`  ${id}  ${f.status.padEnd(12)} p${f.priority}  deps:${deps.padEnd(12)} ${f.name}${f.failure_reason ? `  (${f.failure_reason})` : ""}`);
    }
  }
  const ready = features.filter(([, f]) => f.status === "pending" && f.dependencies.every((d) => progress.features[d]?.status === "done"));
  console.log(`\nReady to start: ${ready.map(([id]) => id).join(", ") || "none"}`);
}
