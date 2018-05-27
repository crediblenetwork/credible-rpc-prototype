# credible-rpc-prototype
# Run in ubuntu or linux server
# 1. Nodejs version is 8.11.1
node --version
# 2. All config set in .env file, override by enviroment ex: .env.production
# 3. Install node mudule
npm install
# 4. Create link modules folder
npm run preinstall
# 5. Run 2 ways:
npm run dev
node pm2.js
