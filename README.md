# pay4world

## Getting Started

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Robin-Kail/element-plus-admin.git
   cd your-repo
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Run the Development Server:**

   ```bash
   pnpm run dev
   ```

### Build and Deployment

1. **Build the Application:**

   ```bash
   pnpm run build:pro
   ```

2. **Start the Production Server:**

   ```bash
   pnpm run serve:pro
   ```

## Testing

To run tests, use:

```bash
pnpm run lint:eslint
```

## Contributing

Here's how you can get started:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Robin-Kail/element-plus-admin.git
   cd your-repo
   ```

2. **Create a Branch:**

   ```bash
   git checkout -b feature/new-feature
   ```

3. **Make Changes:**

   Implement your desired changes in the codebase, documentation, or any other relevant files.

4. **Commit Changes:**

   ```bash
   git commit -m "Add new feature: XYZ"
   ```

5. **Push Changes:**

   ```bash
   git push origin features/new-feature
   ```

6. **Create a Pull Request:**

   Go to the repository on GitHub and create a pull request (PR) from your branch. Provide a detailed description of the changes you've made and any relevant context.

7. **Review and Merge:**

   Your pull request will be reviewed by other team members. Once approved, your changes will be merged into the main branch and your branch should be deleted.

8. **Issue:**

   Once Issue is created and assigned to someone, you should create a branch from the Issue and work on that. The next step is same as "7"

## 运行环境
- node 版本 >= 18.0.0
  (注: 目前使用20+, 如果无法安装依赖, 尝试降node版本到18)
- pnpm 版本 >= 8.1.0
  npm i -g pnpm@8.1.0

## pm2 开发模式运行

```bash
   pm2 start pnpm --name "pay-dev" -- run dev
```

## 部署环境

- 测试环境
  1. 配置nginx, 参考./nginx.conf, 修改对应域名; 修改项目路径, `/www/pay4front/pay4world`改为对应的项目路径, 项目路径通过pwd命令查看,`/dist/current`不需要修改
  2. 执行 deploy.sh
   ```bash
      bash deploy.sh test
   ```
- 生产环境
  1. 配置nginx, 参考./nginx.conf,修改对应域名; 修改项目路径, `/www/pay4front/pay4world`改为对应的项目路径, 项目路径通过pwd命令查看,`/dist/current`不需要修改
  2. 执行 deploy.sh
   ```bash
      bash deploy.sh
   ```
- 回滚到版本
  例如：版本是 v1.0.0
  ```bash
      ln -sfn v1.0.0 current.tmp && mv -fT current.tmp current
      sudo nginx -s reload
  ```