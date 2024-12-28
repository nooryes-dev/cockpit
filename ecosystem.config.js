/**
 * @description
 * ！！！部署过程中请务必按顺序部署！！！
 */
module.exports = {
  apps: [
    {
      name: 'cockpit',
      script: 'pnpm',
      args: 'start',
    },
  ],
};
