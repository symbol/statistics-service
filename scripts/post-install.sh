echo "Running post install hook..."
cd node_modules
cd symbol-node-rewards
cd packages
cd api-spec
npm install
npm run build
echo "symbol-node-rewards api-spec successfully built"
exit 0
