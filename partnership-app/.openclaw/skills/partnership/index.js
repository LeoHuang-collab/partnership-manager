import { exec, process } from 'openclaw-tools';
import { readFile, writeFile, exists } from 'fs/promises';
import { join } from 'path';

const SKILL_DIR = join(__dirname);
const PROJECT_DIR = join(SKILL_DIR, '..', '..'); // partnership-app root
const BACKEND_DIR = join(PROJECT_DIR, 'backend');
const STATE_FILE = join(SKILL_DIR, 'state.json');

// 默认配置
const CONFIG = {
  FRONTEND_PORT: 5175,
  BACKEND_PORT: 3001,
  PM2_GLOBAL: false, // 是否全局安装 PM2
};

class PartnershipSkill {
  constructor() {
    this.state = {
      configured: false,
      cloudflareTunnel: null,
      pm2Running: false,
      lastStart: null,
    };
    this.description = '合作伙伴管理系统 - 一键启动、内网穿透、实时协作';
    this.tags = ['partnership', 'collaboration', 'realtime', 'tunnel'];
  }

  // 默认动作（触发词直接执行）
  async execute(intent, context) {
    return await this.start();
  }

  async loadState() {
    try {
      if (await exists(STATE_FILE)) {
        const data = await readFile(STATE_FILE, 'utf-8');
        this.state = { ...this.state, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load state:', error.message);
    }
  }

  async saveState() {
    try {
      await writeFile(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error.message);
    }
  }

  async checkDependencies() {
    console.log('🔍 检查依赖环境...');

    // 检查 Node.js
    const nodeCheck = await this.execCmd('node --version', { silent: true });
    if (!nodeCheck.success) {
      throw new Error('请先安装 Node.js (https://nodejs.org)');
    }
    console.log(`✅ Node.js: ${nodeCheck.stdout.trim()}`);

    // 检查 npm
    const npmCheck = await this.execCmd('npm --version', { silent: true });
    if (!npmCheck.success) {
      throw new Error('npm 未找到');
    }
    console.log(`✅ npm: ${npmCheck.stdout.trim()}`);

    return true;
  }

  async installDependencies() {
    console.log('📦 安装项目依赖...');

    // 前端依赖
    if (!await this.hasNodeModules(PROJECT_DIR)) {
      console.log('  安装前端依赖...');
      await this.execCmd('npm install', { cwd: PROJECT_DIR, timeout: 300000 });
    } else {
      console.log('✅ 前端依赖已存在');
    }

    // 后端依赖
    if (!await this.hasNodeModules(BACKEND_DIR)) {
      console.log('  安装后端依赖...');
      await this.execCmd('npm install', { cwd: BACKEND_DIR, timeout: 300000 });
    } else {
      console.log('✅ 后端依赖已存在');
    }
  }

  async hasNodeModules(dir) {
    try {
      const nodeModulesPath = join(dir, 'node_modules');
      return await exists(nodeModulesPath);
    } catch {
      return false;
    }
  }

  async ensurePM2() {
    console.log('🔧 检查 PM2 进程守护...');

    const pm2Check = await this.execCmd('pm2 --version', { silent: true });
    if (!pm2Check.success) {
      console.log('  正在安装 PM2 全局模块...');
      await this.execCmd('npm install -g pm2', { timeout: 300000 });
      console.log('✅ PM2 已安装');
    } else {
      console.log(`✅ PM2: ${pm2Check.stdout.trim()}`);
    }
  }

  async startBackend() {
    console.log('🚀 启动后端服务器...');

    // 使用 PM2 启动后端
    const pm2Name = 'partnership-backend';
    await this.execCmd(`pm2 start server.js --name ${pm2Name}`, {
      cwd: BACKEND_DIR,
    });

    // 保存 PM2 配置
    await this.execCmd('pm2 save');

    console.log(`✅ 后端已启动 (PM2: ${pm2Name})`);
    this.state.pm2Running = true;
  }

  async startFrontend() {
    console.log('🎨 启动前端开发服务器...');

    const pm2Name = 'partnership-frontend';

    // 使用 npm run dev，跨平台兼容
    await this.execCmd(`pm2 start "npm" --name ${pm2Name} -- run dev`, {
      cwd: PROJECT_DIR,
    });

    console.log(`✅ 前端已启动 (PM2: ${pm2Name})`);
  }

  async setupCloudflareTunnel() {
    console.log('☁️  配置 Cloudflare Tunnel...');

    const cloudflaredDir = join(PROJECT_DIR, 'cloudflared');
    const exePath = join(cloudflaredDir, 'cloudflared.exe');
    const credentialsPath = join(cloudflaredDir, 'credentials.json');
    const tunnelConfigPath = join(cloudflaredDir, 'config.yml');

    // 检查是否已有配置
    if (await exists(tunnelConfigPath) && await exists(credentialsPath)) {
      console.log('  检测到已有隧道配置，直接启动...');
      await this.startCloudflareTunnel();
      return;
    }

    // 检查并下载 cloudflared
    if (!await exists(exePath)) {
      console.log('  正在下载 Cloudflare Tunnel...');
      await this.downloadCloudflared();
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Cloudflare Tunnel 首次配置');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('  ⚠️  需要 Cloudflare 免费账号（如没有，请先注册 https://dash.cloudflare.com）');
    console.log('');
    console.log('  配置方式 1（推荐 - 自动）:');
    console.log('    - 我将启动 cloudflared 登录流程');
    console.log('    - 浏览器会打开，请扫码登录');
    console.log('    - 登录后自动创建隧道');
    console.log('');
    console.log('  配置方式 2（手动，如果自动失败）:');
    console.log('    a. 手动运行: cloudflared tunnel login');
    console.log('    b. 在 https://one.dash.cloudflare.com/ 创建隧道');
    console.log('    c. 命名: "partnership-app"，指向 localhost:5175');
    console.log('    d. 下载配置到: cloudflared/config.yml');
    console.log('');

    // 尝试自动登录
    try {
      console.log('  开始自动登录流程...');
      await this.execCmd(`"${exePath}" tunnel login`, {
        cwd: PROJECT_DIR,
        timeout: 120000,
      });
    } catch (error) {
      console.log('❌ 自动登录失败，请手动配置');
      console.log('');
      console.log('  手动配置步骤:');
      console.log(`    1. 打开命令行，进入: ${PROJECT_DIR}`);
      console.log(`    2. 运行: cloudflared tunnel login`);
      console.log('    3. 扫码登录 Cloudflare');
      console.log('    4. 在 https://one.dash.cloudflare.com/ 创建隧道');
      console.log('    5. 下载 config.yml 到 cloudflared/ 目录');
      console.log('');
      throw new Error('请完成手动配置后，再次运行"启动合作伙伴管理"');
    }

    // 检查登录后是否生成了 credentials.json
    if (!await exists(credentialsPath)) {
      throw new Error('登录未成功，未生成 credentials.json');
    }

    // 检查隧道配置
    if (!await exists(tunnelConfigPath)) {
      console.log('  自动创建隧道配置...');
      await this.createTunnelConfig(exePath);
    }

    await this.startCloudflareTunnel();
  }

  async createTunnelConfig(cloudflaredPath) {
    console.log('  正在创建隧道配置...');

    // 创建默认配置文件
    const tunnelConfig = `tunnel: ${Date.now()}
credentials-file: ${join('cloudflared', 'credentials.json')}

ingress:
  - hostname: partnership-${Math.random().toString(36).substring(2, 8)}.trycloudflare.com
    service: http://localhost:${CONFIG.FRONTEND_PORT}
  - service: http_status:404
`;

    const cloudflaredDir = join(PROJECT_DIR, 'cloudflared');
    await this.ensureDir(cloudflaredDir);
    await writeFile(join(cloudflaredDir, 'config.yml'), tunnelConfig);

    console.log('✅ 隧道配置已创建 (cloudflared/config.yml)');
  }

  async downloadCloudflared() {
    console.log('  下载 cloudflared...');
    const cloudflaredDir = join(PROJECT_DIR, 'cloudflared');
    await this.ensureDir(cloudflaredDir);

    // Windows 下载
    const downloadUrl = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
    const exePath = join(cloudflaredDir, 'cloudflared.exe');

    // 使用 PowerShell 下载（支持 TLS 1.2）
    const downloadCmd = `powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${downloadUrl}' -OutFile '${exePath}' -UseBasicParsing"`;
    await this.execCmd(downloadCmd, { timeout: 120000 });

    console.log('✅ Cloudflared 下载完成');
  }

  async startCloudflareTunnel() {
    console.log('🌐 启动 Cloudflare Tunnel...');

    const cloudflaredDir = join(PROJECT_DIR, 'cloudflared');
    const exePath = join(cloudflaredDir, 'cloudflared.exe');

    if (!await exists(exePath)) {
      throw new Error('cloudflared.exe 不存在');
    }

    // 停止可能存在的旧隧道
    await this.execCmd('pm2 stop cloudflared-tunnel', { silent: true });
    await this.execCmd('pm2 delete cloudflared-tunnel', { silent: true });

    // 启动隧道（在 cloudflared 目录下，使用相对路径 config.yml）
    await this.execCmd(`pm2 start "cloudflared.exe" --name cloudflared-tunnel -- tunnel --config config.yml`, {
      cwd: cloudflaredDir,
    });

    // 等待隧道建立
    console.log('⏳ 等待隧道建立 (15秒)...');
    await this.sleep(15000);

    // 获取公网地址
    try {
      const tunnelInfo = await this.execCmd('pm2 logs cloudflared-tunnel --lines 50', { silent: true });
      const urlMatch = tunnelInfo.stdout.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (urlMatch) {
        this.state.cloudflareTunnel = urlMatch[0];
        console.log(`✅ 公网访问地址: ${this.state.cloudflareTunnel}`);
      } else {
        console.log('⚠️  无法自动获取隧道地址，但隧道可能已启动');
        console.log('   手动查看日志: pm2 logs cloudflared-tunnel');
      }
    } catch (error) {
      console.log('⚠️  无法获取隧道日志');
    }

    await this.execCmd('pm2 save');
  }

  async ensureDir(dir) {
    const fs = await import('fs');
    if (!(await exists(dir))) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async execCmd(cmd, options = {}) {
    return new Promise((resolve) => {
      const merged = {
        timeout: 30000,
        ...options,
      };

      exec(cmd, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
        });
      }, merged);
    });
  }

  async start() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🚀 启动合作伙伴管理系统');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
      await this.loadState();

      // 1. 检查环境
      await this.checkDependencies();

      // 2. 安装依赖
      await this.installDependencies();

      // 3. 安装 PM2
      await this.ensurePM2();

      // 4. 启动后端
      await this.startBackend();

      // 5. 启动前端
      await this.startFrontend();

      // 6. 配置隧道
      await this.setupCloudflareTunnel();

      // 7. 保存状态
      this.state.configured = true;
      this.state.lastStart = new Date().toISOString();
      await this.saveState();

      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('  ✅ 系统启动成功！');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('  访问方式:');
      console.log(`    🏠 本机: http://localhost:${CONFIG.FRONTEND_PORT}`);
      if (this.state.cloudflareTunnel) {
        console.log(`    🌐 公网: ${this.state.cloudflareTunnel}`);
      }
      console.log('');
      console.log('  PM2 管理命令:');
      console.log('    pm2 list              # 查看所有进程');
      console.log('    pm2 logs partnership  # 查看日志');
      console.log('    pm2 stop all          # 停止所有');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');

      return {
        success: true,
        message: '系统已启动',
        tunnelUrl: this.state.cloudflareTunnel,
        localUrl: `http://localhost:${CONFIG.FRONTEND_PORT}`,
      };
    } catch (error) {
      console.error('❌ 启动失败:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async stop() {
    console.log('🛑 停止系统...');

    try {
      await this.execCmd('pm2 stop all');
      await this.execCmd('pm2 delete all');
      await this.execCmd('pm2 save');

      this.state.pm2Running = false;
      await this.saveState();

      console.log('✅ 系统已停止');
      return { success: true };
    } catch (error) {
      console.error('❌ 停止失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  async status() {
    try {
      const result = await this.execCmd('pm2 jlist', { silent: true });
      const processes = JSON.parse(result.stdout || '[]');

      const backend = processes.find(p => p.name === 'partnership-backend');
      const frontend = processes.find(p => p.name === 'partnership-frontend');
      const tunnel = processes.find(p => p.name === 'cloudflared-tunnel');

      return {
        success: true,
        configured: this.state.configured,
        processes: {
          backend: backend ? { status: backend.pm2_env.status, pid: backend.pid } : null,
          frontend: frontend ? { status: frontend.pm2_env.status, pid: frontend.pid } : null,
          tunnel: tunnel ? { status: tunnel.pm2_env.status, pid: tunnel.pid } : null,
        },
        tunnelUrl: this.state.cloudflareTunnel,
        localUrl: `http://localhost:${CONFIG.FRONTEND_PORT}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async restart() {
    await this.stop();
    return await this.start();
  }
}

export default new PartnershipSkill();
